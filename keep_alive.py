import subprocess
import os
import sys

def main():
    cwd = r"d:\SIH_2026"
    bat_file = os.path.join(cwd, "start.bat")
    
    # 0x00000008 is DETACHED_PROCESS on Windows
    # This prevents the AI agent from killing the process when the session cycles
    subprocess.Popen(["cmd.exe", "/c", bat_file], cwd=cwd, creationflags=0x00000008)
    print("Launched start.bat detached from AI session. Servers will stay alive permanently!")

if __name__ == "__main__":
    main()
