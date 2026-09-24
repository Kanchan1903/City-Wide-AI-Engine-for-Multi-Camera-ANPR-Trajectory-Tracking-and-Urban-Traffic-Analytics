import osmnx as ox
import networkx as nx
from shapely.geometry import LineString
import logging

logger = logging.getLogger(__name__)


class SimpleRouteMatcher:
    def __init__(self):
        self.G = None
        self.loaded_bbox = None  # (west, south, east, north) of the currently cached graph

    def load_graph(self, min_lat, max_lat, min_lon, max_lon, buffer_deg=0.01):
        """Load the road network graph for the area."""
        north = max_lat + buffer_deg
        south = min_lat - buffer_deg
        east = max_lon + buffer_deg
        west = min_lon - buffer_deg

        logger.info(f"Loading OSM graph for bbox: W:{west}, S:{south}, E:{east}, N:{north}")
        # OSMnx 2.x bbox format is (west, south, east, north)
        self.G = ox.graph_from_bbox(bbox=(west, south, east, north), network_type='drive', simplify=True)
        self.loaded_bbox = (west, south, east, north)
        logger.info(f"Graph loaded with {len(self.G.nodes)} nodes and {len(self.G.edges)} edges.")

    def _bbox_covers(self, min_lat, max_lat, min_lon, max_lon, margin_deg=0.005):
        """
        Check whether the currently loaded graph's bbox safely covers new
        coordinates, with a small inward margin so points near the original
        edge of the graph (where OSMnx may not have full connectivity) force
        a reload rather than silently snapping to a poor/edge node.
        """
        if self.loaded_bbox is None:
            return False
        west, south, east, north = self.loaded_bbox
        return (
            west + margin_deg <= min_lon and max_lon <= east - margin_deg and
            south + margin_deg <= min_lat and max_lat <= north - margin_deg
        )

    def get_route(self, coordinates):
        """
        Compute the shortest path along the road network, segment by segment
        between each consecutive pair of confirmed camera detections.

        coordinates: list of dicts [{'lat': lat, 'lon': lon}, ...]

        Returns a dict:
            {
                "path": [[lat, lon], ...]          -> full flattened route
                "segments": [[[lat, lon], ...], ...] -> one list per hop,
                                                         useful for debug
                                                         plotting/color-coding
            }
        """
        lats = [c['lat'] for c in coordinates]
        lons = [c['lon'] for c in coordinates]

        # Reload the graph if it doesn't safely cover this trajectory's
        # bounding box, instead of reusing a stale/undersized cached graph.
        if self.G is None or not self._bbox_covers(min(lats), max(lats), min(lons), max(lons)):
            self.load_graph(min(lats), max(lats), min(lons), max(lons))

        final_path = []
        segments = []

        for i in range(len(coordinates) - 1):
            start_lon, start_lat = coordinates[i]['lon'], coordinates[i]['lat']
            end_lon, end_lat = coordinates[i + 1]['lon'], coordinates[i + 1]['lat']

            start_node = ox.distance.nearest_nodes(self.G, start_lon, start_lat)
            end_node = ox.distance.nearest_nodes(self.G, end_lon, end_lat)

            segment_path = []

            try:
                route = nx.shortest_path(self.G, start_node, end_node, weight="length")

                # Use route_to_gdf, NOT get_route_edge_attributes.
                #
                # Why: self.G is a MultiDiGraph, so OSM often has multiple
                # parallel edges between the same two nodes (a main road +
                # a service lane/driveway/divided-highway carriageway).
                # nx.shortest_path correctly picks the shortest edge for
                # ROUTING, but get_route_edge_attributes does not reliably
                # fetch the GEOMETRY of that same specific edge — it can
                # silently return a different parallel edge's geometry,
                # which is what was causing the path to jump onto nearby
                # unrelated roads/driveways near houses and shops.
                # route_to_gdf resolves geometry against the exact edge
                # (correct parallel-edge key) that was actually used for
                # the shortest path.
                route_gdf = ox.routing.route_to_gdf(self.G, route, weight="length")

                for geom in route_gdf["geometry"]:
                    if geom is None:
                        continue
                    coords = list(geom.coords)
                    seg = [[c[1], c[0]] for c in coords]  # (lon, lat) -> [lat, lon]

                    if not segment_path:
                        segment_path.extend(seg)
                    elif segment_path[-1] == seg[0]:
                        segment_path.extend(seg[1:])
                    else:
                        segment_path.extend(seg)

            except nx.NetworkXNoPath:
                logger.warning(f"No path found between {start_node} and {end_node}")
                segment_path = [[start_lat, start_lon], [end_lat, end_lon]]

            segments.append(segment_path)

            if not final_path:
                final_path.extend(segment_path)
            elif segment_path and final_path[-1] == segment_path[0]:
                final_path.extend(segment_path[1:])
            else:
                final_path.extend(segment_path)

        return {"path": final_path, "segments": segments}


# Global instance to cache the graph
route_matcher = SimpleRouteMatcher()
