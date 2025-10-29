from flask import Blueprint, request, jsonify
from algorithms.bankers_algorithm import BankersAlgorithm
from algorithms.wait_for_graph import WaitForGraph
from algorithms.deadlock_recovery import DeadlockRecovery
from algorithms.detection_algorithm import DeadlockDetection
from algorithms.prevention_strategies import DeadlockPrevention
from algorithms.realtime_monitor import RealTimeDeadlockMonitor
from models.simulation import Simulation
from reports.report_generator import ReportGenerator
import json

deadlock_bp = Blueprint('deadlock', __name__)

@deadlock_bp.route('/bankers', methods=['POST'])
def bankers_algorithm():
    data = request.json
    
    try:
        banker = BankersAlgorithm(
            data['processes'],
            data['resources'],
            data['allocation'],
            data.get('max_need') or data.get('maxNeed'),
            data['available']
        )
        
        step_by_step = data.get('step_by_step', False)
        is_safe, sequence = banker.is_safe_state(step_by_step)
        
        response = {
            "is_safe": is_safe,
            "safe_sequence": sequence,
            "current_state": {
                "allocation": banker.allocation.tolist(),
                "need": banker.need.tolist(),
                "available": banker.available.tolist()
            }
        }
        
        if step_by_step:
            response["steps"] = banker.steps
            
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@deadlock_bp.route('/detection', methods=['POST'])
def detection_algorithm():
    data = request.json
    
    try:
        detector = DeadlockDetection(
            data['processes'],
            data['resources'],
            data['allocation'],
            data['request']
        )
        
        result = detector.detect_deadlock_step_by_step()
        wait_for_graph = detector.build_wait_for_graph()
        
        return jsonify({
            "detection_result": result,
            "wait_for_graph": wait_for_graph,
            "available_resources": detector.available.tolist()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@deadlock_bp.route('/prevention', methods=['GET'])
def prevention_strategies():
    try:
        prevention = DeadlockPrevention()
        strategies = prevention.get_all_strategies()
        comparison = prevention.compare_strategies()
        
        return jsonify({
            "strategies": strategies,
            "comparison": comparison
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@deadlock_bp.route('/prevention/simulate', methods=['POST'])
def simulate_prevention():
    data = request.json
    
    try:
        prevention = DeadlockPrevention()
        result = prevention.simulate_resource_ordering(
            data['processes'],
            data['resources'],
            data['requests']
        )
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@deadlock_bp.route('/request-resources', methods=['POST'])
def request_resources():
    data = request.json
    
    try:
        banker = BankersAlgorithm(
            data['processes'],
            data['resources'],
            data['allocation'],
            data.get('max_need') or data.get('maxNeed'),
            data['available']
        )
        
        success, message = banker.request_resources(
            data['process_id'],
            data['request']
        )
        
        return jsonify({
            "success": success,
            "message": message,
            "new_state": {
                "allocation": banker.allocation.tolist(),
                "need": banker.need.tolist(),
                "available": banker.available.tolist()
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@deadlock_bp.route('/detect-deadlock', methods=['POST'])
def detect_deadlock():
    data = request.json
    
    try:
        wfg = WaitForGraph(data['processes'])
        
        # Build wait-for graph from resource allocation
        for edge in data.get('edges', []):
            wfg.add_edge(edge['from'], edge['to'])
        
        has_deadlock, cycle = wfg.detect_deadlock()
        graph_data = wfg.get_graph_data()
        
        return jsonify({
            "has_deadlock": has_deadlock,
            "deadlock_cycle": cycle,
            "graph": graph_data
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@deadlock_bp.route('/recovery-options', methods=['POST'])
def recovery_options():
    data = request.json
    
    try:
        recovery = DeadlockRecovery(
            data['processes'],
            data['resources'],
            data['allocation']
        )
        
        termination_options = recovery.process_termination(data['deadlock_cycle'])
        preemption_options = recovery.resource_preemption(
            data['deadlock_cycle'],
            data['available']
        )
        
        return jsonify({
            "termination_options": termination_options,
            "preemption_options": preemption_options
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@deadlock_bp.route('/simulate', methods=['POST'])
def simulate_scenario():
    data = request.json
    
    try:
        simulation = Simulation(data)
        results = simulation.run()
        
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@deadlock_bp.route('/generate-report', methods=['POST'])
def generate_report():
    data = request.json
    
    try:
        report_gen = ReportGenerator()
        
        if data.get('type') == 'comparison':
            filename = report_gen.generate_comparison_report(data['comparison_data'])
        else:
            filename = report_gen.generate_simulation_report(data['simulation_data'])
        
        return jsonify({
            "success": True,
            "filename": filename,
            "message": "Report generated successfully"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@deadlock_bp.route('/export-data', methods=['POST'])
def export_data():
    data = request.json
    
    try:
        report_gen = ReportGenerator()
        filename = report_gen.export_simulation_data(
            data['simulation_data'],
            data.get('format', 'json')
        )
        
        return jsonify({
            "success": True,
            "filename": filename,
            "message": "Data exported successfully"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Real-time monitoring endpoints
rt_monitor = RealTimeDeadlockMonitor()

@deadlock_bp.route('/realtime/init', methods=['POST'])
def init_realtime_system():
    data = request.json
    
    try:
        # Reset existing system completely
        global rt_monitor
        rt_monitor.reset_system()
        
        # Add processes
        for proc in data['processes']:
            rt_monitor.add_process(proc['id'], proc['name'], proc['priority'])
            
        # Add resources
        for res in data['resources']:
            rt_monitor.add_resource(res['id'], res['name'], res['total'])
            
        # Start fresh monitoring
        rt_monitor.start_monitoring()
            
        return jsonify({"success": True, "message": "Real-time system initialized"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@deadlock_bp.route('/realtime/request', methods=['POST'])
def realtime_request_resource():
    data = request.json
    
    try:
        success, message = rt_monitor.request_resource(
            data['process_id'], 
            data['resource_id']
        )
        
        has_deadlock, cycle = rt_monitor.detect_deadlock()
        system_state = rt_monitor.get_system_state()
        
        return jsonify({
            "success": success,
            "message": message,
            "has_deadlock": has_deadlock,
            "deadlock_cycle": cycle,
            "system_state": system_state
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@deadlock_bp.route('/realtime/release', methods=['POST'])
def realtime_release_resource():
    data = request.json
    
    try:
        success, message = rt_monitor.release_resource(
            data['process_id'], 
            data['resource_id']
        )
        
        system_state = rt_monitor.get_system_state()
        
        return jsonify({
            "success": success,
            "message": message,
            "system_state": system_state
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@deadlock_bp.route('/realtime/status', methods=['GET'])
def get_realtime_status():
    try:
        has_deadlock, cycle = rt_monitor.detect_deadlock()
        system_state = rt_monitor.get_system_state()
        performance_metrics = rt_monitor.get_performance_metrics()
        
        return jsonify({
            "has_deadlock": has_deadlock,
            "deadlock_cycle": cycle,
            "system_state": system_state,
            "performance_metrics": performance_metrics
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@deadlock_bp.route('/realtime/auto-resolve', methods=['POST'])
def auto_resolve_deadlock():
    try:
        has_deadlock, cycle = rt_monitor.detect_deadlock()
        if has_deadlock:
            resolved, message = rt_monitor.auto_resolve_deadlock(cycle)
            return jsonify({
                "resolved": resolved,
                "message": message,
                "system_state": rt_monitor.get_system_state()
            })
        else:
            return jsonify({
                "resolved": False,
                "message": "No deadlock detected"
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@deadlock_bp.route('/realtime/metrics', methods=['GET'])
def get_performance_metrics():
    try:
        metrics = rt_monitor.get_performance_metrics()
        return jsonify(metrics)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@deadlock_bp.route('/realtime/full-log', methods=['GET'])
def get_full_simulation_log():
    try:
        full_log = rt_monitor.get_full_simulation_log()
        return jsonify(full_log)
    except Exception as e:
        return jsonify({"error": str(e)}), 400