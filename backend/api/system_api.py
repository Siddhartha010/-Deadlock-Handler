from flask import Blueprint, jsonify
import psutil
import time

system_bp = Blueprint('system', __name__)

@system_bp.route('/test', methods=['GET'])
def test_endpoint():
    return jsonify({'message': 'System API is working'})

@system_bp.route('/processes', methods=['GET'])
def get_processes():
    try:
        processes = []
        # Get processes with basic info first
        for proc in psutil.process_iter():
            try:
                pinfo = proc.as_dict(attrs=['pid', 'name', 'cpu_percent', 'memory_info', 'status'])
                processes.append({
                    'pid': pinfo['pid'],
                    'name': pinfo['name'] or 'Unknown',
                    'cpu': round(pinfo['cpu_percent'] or 0, 1),
                    'memory': round((pinfo['memory_info'].rss if pinfo['memory_info'] else 0) / 1024 / 1024, 1),
                    'status': pinfo['status'] or 'unknown'
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue
        
        # Sort by memory usage and take top 15
        processes.sort(key=lambda x: x['memory'], reverse=True)
        return jsonify({'processes': processes[:15]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@system_bp.route('/resources', methods=['GET'])
def get_resources():
    try:
        cpu_percent = psutil.cpu_percent(interval=0.1, percpu=True)
        memory = psutil.virtual_memory()
        
        # Use C: drive for Windows
        try:
            disk = psutil.disk_usage('C:\\')
        except:
            disk = psutil.disk_usage('/')
        
        resources = [
            {'name': f'CPU Core {i+1}', 'usage': round(cpu, 1), 'total': 100, 'unit': '%'}
            for i, cpu in enumerate(cpu_percent)
        ]
        
        resources.extend([
            {
                'name': 'Memory',
                'usage': round(memory.used / 1024**3, 1),
                'total': round(memory.total / 1024**3, 1),
                'unit': 'GB'
            },
            {
                'name': 'Disk C:',
                'usage': round(disk.used / 1024**3, 1),
                'total': round(disk.total / 1024**3, 1),
                'unit': 'GB'
            }
        ])
        
        return jsonify({'resources': resources})
    except Exception as e:
        return jsonify({'error': str(e)}), 500