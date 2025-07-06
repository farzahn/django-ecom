#!/usr/bin/env python3
"""
Development Environment Cleanup Script
Kills all React, Django processes and Docker containers, then prunes Docker
"""

import subprocess
import sys
import os
import signal

def run_command(command, description="", ignore_errors=False):
    """Run a shell command and handle errors"""
    print(f"\n{description}")
    print(f"Running: {command}")
    
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            capture_output=True, 
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            print(f"✅ Success: {description}")
            if result.stdout.strip():
                print(f"Output: {result.stdout.strip()}")
        else:
            if ignore_errors:
                print(f"⚠️  Warning: {description} - {result.stderr.strip()}")
            else:
                print(f"❌ Error: {description} - {result.stderr.strip()}")
                
    except subprocess.TimeoutExpired:
        print(f"⏰ Timeout: {description}")
    except Exception as e:
        print(f"💥 Exception: {description} - {str(e)}")

def kill_processes_by_name(process_name):
    """Kill all processes matching a name"""
    # First try to find processes
    find_cmd = f"pgrep -f '{process_name}'"
    
    try:
        result = subprocess.run(find_cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0 and result.stdout.strip():
            pids = result.stdout.strip().split('\n')
            print(f"Found {len(pids)} {process_name} processes: {', '.join(pids)}")
            
            # Kill processes gracefully first
            kill_cmd = f"pkill -f '{process_name}'"
            run_command(kill_cmd, f"Gracefully killing {process_name} processes", ignore_errors=True)
            
            # Wait a moment
            subprocess.run("sleep 2", shell=True)
            
            # Force kill if still running
            force_kill_cmd = f"pkill -9 -f '{process_name}'"
            run_command(force_kill_cmd, f"Force killing {process_name} processes", ignore_errors=True)
        else:
            print(f"No {process_name} processes found")
            
    except Exception as e:
        print(f"Error finding {process_name} processes: {str(e)}")

def main():
    print("🧹 Development Environment Cleanup Script")
    print("=" * 50)
    
    # Kill React processes (npm start, yarn start, etc.)
    print("\n📱 Killing React processes...")
    kill_processes_by_name("npm.*start")
    kill_processes_by_name("yarn.*start")
    kill_processes_by_name("react-scripts")
    kill_processes_by_name("webpack")
    kill_processes_by_name("node.*3000")  # Common React dev server port
    
    # Kill Django processes
    print("\n🐍 Killing Django processes...")
    kill_processes_by_name("python.*manage.py")
    kill_processes_by_name("django")
    kill_processes_by_name("runserver")
    kill_processes_by_name("python.*8000")  # Common Django dev server port
    
    # Kill any Node.js processes on common dev ports
    print("\n🌐 Killing Node.js development servers...")
    for port in [3000, 3001, 8000, 8080, 5000, 5173]:
        kill_processes_by_name(f"node.*{port}")
    
    # Stop all Docker containers
    print("\n🐳 Stopping Docker containers...")
    run_command("docker stop $(docker ps -q)", "Stopping all running Docker containers", ignore_errors=True)
    
    # Remove all Docker containers
    print("\n🗑️  Removing Docker containers...")
    run_command("docker rm $(docker ps -aq)", "Removing all Docker containers", ignore_errors=True)
    
    # Docker system prune
    print("\n🧽 Pruning Docker system...")
    run_command("docker system prune -f", "Pruning Docker system (images, networks, build cache)")
    
    # Optional: Remove all Docker images (uncomment if needed)
    # print("\n🖼️  Removing Docker images...")
    # run_command("docker rmi $(docker images -q)", "Removing all Docker images", ignore_errors=True)
    
    # Optional: Remove Docker volumes (uncomment if needed)
    # print("\n💾 Removing Docker volumes...")
    # run_command("docker volume prune -f", "Pruning Docker volumes")
    
    print("\n✨ Cleanup complete!")
    print("All React, Django, and Docker processes have been terminated.")
    print("Docker system has been pruned.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Script interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n💥 Unexpected error: {str(e)}")
        sys.exit(1)