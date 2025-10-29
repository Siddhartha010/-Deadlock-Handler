import time
import threading
from collections import defaultdict, deque
import asyncio

class RealTimeDeadlockMonitor:
    def __init__(self):
        self.processes = {}
        self.resources = {}
        self.allocation_matrix = defaultdict(dict)
        self.request_matrix = defaultdict(dict)
        self.monitoring = False
        self.deadlock_callbacks = []
        self.event_queue = deque(maxlen=1000)
        self.performance_metrics = {
            'requests_processed': 0,
            'deadlocks_detected': 0,
            'avg_response_time': 0,
            'throughput': 0
        }
        self.last_check_time = time.time()
        
    def reset_system(self):
        """Complete system reset to initial state"""
        self.stop_monitoring()
        self.processes.clear()
        self.resources.clear()
        self.allocation_matrix.clear()
        self.request_matrix.clear()
        self.event_queue.clear()
        self.deadlock_callbacks.clear()
        self.performance_metrics = {
            'requests_processed': 0,
            'deadlocks_detected': 0,
            'avg_response_time': 0,
            'throughput': 0
        }
        self.last_check_time = time.time()
        self._session_id = int(time.time())
        self._start_time = time.time()
        self._deadlock_history = []
        
    def add_process(self, process_id, name, priority):
        self.processes[process_id] = {
            'name': name,
            'priority': priority,
            'resources': set(),
            'waiting_for': set(),
            'timestamp': time.time()
        }
        
    def add_resource(self, resource_id, name, total_instances):
        self.resources[resource_id] = {
            'name': name,
            'total': total_instances,
            'available': total_instances,
            'holders': set()
        }
        
    def request_resource(self, process_id, resource_id):
        start_time = time.time()
        
        if resource_id not in self.resources or process_id not in self.processes:
            return False, "Invalid process or resource"
            
        resource = self.resources[resource_id]
        process = self.processes[process_id]
        
        # Check if already holding or waiting
        if resource_id in process['resources']:
            return True, f"Process {process['name']} already holds {resource['name']}"
        if resource_id in process['waiting_for']:
            return False, f"Process {process['name']} already waiting for {resource['name']}"
        
        if resource['available'] > 0:
            # Grant resource immediately
            resource['available'] -= 1
            resource['holders'].add(process_id)
            process['resources'].add(resource_id)
            self.allocation_matrix[process_id][resource_id] = 1
            
            self._log_event('GRANT', process_id, resource_id, start_time)
            self.performance_metrics['requests_processed'] += 1
            return True, f"Resource {resource['name']} granted to {process['name']}"
        else:
            # Process must wait - check for potential deadlock before adding to queue
            if self._would_cause_deadlock(process_id, resource_id):
                return False, f"Request denied - would cause deadlock"
                
            process['waiting_for'].add(resource_id)
            self.request_matrix[process_id][resource_id] = 1
            
            self._log_event('WAIT', process_id, resource_id, start_time)
            return False, f"Process {process['name']} waiting for {resource['name']}"
            
    def release_resource(self, process_id, resource_id):
        if resource_id in self.processes[process_id]['resources']:
            resource = self.resources[resource_id]
            process = self.processes[process_id]
            
            resource['available'] += 1
            resource['holders'].discard(process_id)
            process['resources'].discard(resource_id)
            self.allocation_matrix[process_id].pop(resource_id, None)
            
            return True, f"Resource {resource['name']} released by {process['name']}"
        return False, "Resource not held by process"
        
    def detect_deadlock(self):
        # Fast deadlock detection using optimized algorithm
        current_time = time.time()
        
        # Only check if enough time has passed (throttling)
        if current_time - self.last_check_time < 0.1:  # 100ms throttle
            return False, []
        
        self.last_check_time = current_time
        
        # Build adjacency list for wait-for graph
        wait_graph = defaultdict(list)
        waiting_processes = set()
        
        for proc_id, process in self.processes.items():
            if process['waiting_for']:
                waiting_processes.add(proc_id)
                for resource_id in process['waiting_for']:
                    # Check if the resource exists and has holders
                    if resource_id in self.resources:
                        for holder_id in self.resources[resource_id]['holders']:
                            if holder_id != proc_id:
                                wait_graph[proc_id].append(holder_id)
        
        # Fast cycle detection using DFS with early termination
        if len(waiting_processes) < 2:
            return False, []
            
        visited = set()
        rec_stack = set()
        
        def find_cycle(node, path=None):
            if path is None:
                path = []
                
            if node in rec_stack:
                # Found cycle, get the cycle portion from the path
                cycle_start_idx = path.index(node)
                return path[cycle_start_idx:]
                
            if node in visited or node not in waiting_processes:
                return None
                
            visited.add(node)
            rec_stack.add(node)
            path.append(node)
            
            for neighbor in wait_graph[node]:
                cycle = find_cycle(neighbor, path.copy())
                if cycle:
                    self.performance_metrics['deadlocks_detected'] += 1
                    return cycle
                    
            rec_stack.remove(node)
            return None
        
        for process_id in waiting_processes:
            if process_id not in visited:
                cycle = find_cycle(process_id)
                if cycle:
                    # Log deadlock occurrence
                    deadlock_event = {
                        'timestamp': current_time,
                        'type': 'DEADLOCK_DETECTED',
                        'cycle': cycle,
                        'affected_processes': cycle
                    }
                    if not hasattr(self, '_deadlock_history'):
                        self._deadlock_history = []
                    self._deadlock_history.append(deadlock_event)
                    return True, cycle
                    
        return False, []
        
    def get_system_state(self):
        return {
            'processes': {
                pid: {
                    'name': p['name'],
                    'priority': p['priority'],
                    'resources': list(p['resources']),
                    'waiting_for': list(p['waiting_for'])
                } for pid, p in self.processes.items()
            },
            'resources': {
                rid: {
                    'name': r['name'],
                    'total': r['total'],
                    'available': r['available'],
                    'holders': list(r['holders'])
                } for rid, r in self.resources.items()
            },
            'allocation_matrix': dict(self.allocation_matrix),
            'request_matrix': dict(self.request_matrix)
        }
        
    def get_full_simulation_log(self):
        """Get complete simulation history from start to current state"""
        return {
            'session_id': getattr(self, '_session_id', int(time.time())),
            'start_time': getattr(self, '_start_time', time.time()),
            'current_time': time.time(),
            'events': list(self.event_queue),
            'performance_metrics': self.performance_metrics.copy(),
            'final_state': self.get_system_state(),
            'deadlock_history': getattr(self, '_deadlock_history', []),
            'total_events': len(self.event_queue)
        }
        
    def start_monitoring(self, interval=0.5):
        self.monitoring = True
        self._start_time = time.time()
        
        def monitor_loop():
            while self.monitoring:
                has_deadlock, cycle = self.detect_deadlock()
                if has_deadlock:
                    # Auto-resolve if enabled, otherwise notify callbacks
                    resolved, message = self.auto_resolve_deadlock(cycle)
                    if not resolved:
                        for callback in self.deadlock_callbacks:
                            callback(cycle)
                            
                # Process any waiting requests that can now be granted
                self._process_waiting_queue()
                time.sleep(interval)
                
        monitor_thread = threading.Thread(target=monitor_loop)
        monitor_thread.daemon = True
        monitor_thread.start()
        
    def _process_waiting_queue(self):
        """Process waiting requests when resources become available"""
        for proc_id, process in self.processes.items():
            waiting_copy = process['waiting_for'].copy()
            for resource_id in waiting_copy:
                if self.resources[resource_id]['available'] > 0:
                    # Try to grant the resource
                    process['waiting_for'].discard(resource_id)
                    self.request_matrix[proc_id].pop(resource_id, None)
                    
                    # Grant resource
                    resource = self.resources[resource_id]
                    resource['available'] -= 1
                    resource['holders'].add(proc_id)
                    process['resources'].add(resource_id)
                    self.allocation_matrix[proc_id][resource_id] = 1
                    
                    self._log_event('AUTO_GRANT', proc_id, resource_id, time.time())
        
    def stop_monitoring(self):
        self.monitoring = False
        
    def add_deadlock_callback(self, callback):
        self.deadlock_callbacks.append(callback)
        
    def _would_cause_deadlock(self, process_id, resource_id):
        """Fast check if granting request would cause immediate deadlock"""
        # Simulate adding the wait relationship
        temp_waiting = self.processes[process_id]['waiting_for'].copy()
        temp_waiting.add(resource_id)
        
        # Check if this creates a simple cycle
        for holder_id in self.resources[resource_id]['holders']:
            if holder_id != process_id:
                # Check if holder is waiting for any resource held by process_id
                holder_waiting = self.processes[holder_id]['waiting_for']
                process_resources = self.processes[process_id]['resources']
                
                if any(res in process_resources for res in holder_waiting):
                    return True
        return False
        
    def _log_event(self, event_type, process_id, resource_id, start_time):
        """Log system events for performance analysis"""
        event = {
            'timestamp': time.time(),
            'type': event_type,
            'process_id': process_id,
            'resource_id': resource_id,
            'response_time': time.time() - start_time,
            'process_name': self.processes[process_id]['name'],
            'resource_name': self.resources[resource_id]['name']
        }
        self.event_queue.append(event)
        
        # Update performance metrics
        if len(self.event_queue) > 10:
            recent_events = list(self.event_queue)[-10:]
            avg_response = sum(e['response_time'] for e in recent_events) / len(recent_events)
            self.performance_metrics['avg_response_time'] = avg_response
            
    def get_performance_metrics(self):
        """Get real-time performance statistics"""
        current_time = time.time()
        if hasattr(self, '_start_time'):
            uptime = current_time - self._start_time
            self.performance_metrics['throughput'] = self.performance_metrics['requests_processed'] / max(uptime, 1)
        
        return self.performance_metrics.copy()
        
    def auto_resolve_deadlock(self, cycle):
        """Automatically resolve deadlock using priority-based termination"""
        if not cycle:
            return False, "No cycle to resolve"
            
        # Find lowest priority process in cycle
        min_priority_proc = min(cycle, key=lambda p: self._get_priority_value(p))
        
        # Terminate process (release all resources)
        terminated_resources = list(self.processes[min_priority_proc]['resources'])
        for resource_id in terminated_resources:
            self.release_resource(min_priority_proc, resource_id)
            
        # Clear waiting requests
        self.processes[min_priority_proc]['waiting_for'].clear()
        
        return True, f"Process {min_priority_proc} terminated to resolve deadlock"
        
    def _get_priority_value(self, process_id):
        """Convert priority to numeric value for comparison"""
        priority_map = {'High': 3, 'Medium': 2, 'Low': 1}
        return priority_map.get(self.processes[process_id]['priority'], 1)