import numpy as np
from collections import defaultdict

class DeadlockDetection:
    def __init__(self, processes, resources, allocation, request):
        self.processes = processes
        self.resources = resources
        self.allocation = np.array(allocation)
        self.request = np.array(request)
        self.available = self._calculate_available()
        self.steps = []
        
    def _calculate_available(self):
        total_allocated = np.sum(self.allocation, axis=0)
        # Assume total resources (can be passed as parameter)
        total_resources = total_allocated + np.array([2, 1, 1])  # Example
        return total_resources - total_allocated
    
    def detect_deadlock_step_by_step(self):
        work = self.available.copy()
        finish = [False] * self.processes
        self.steps = []
        
        self.steps.append({
            "step": 0,
            "description": "Initialize work = available resources",
            "work": work.tolist(),
            "finish": finish.copy(),
            "action": "initialization"
        })
        
        step_count = 1
        found_process = True
        
        while found_process:
            found_process = False
            
            for i in range(self.processes):
                if not finish[i]:
                    # Check if request[i] <= work
                    if all(self.request[i] <= work):
                        # Process can complete
                        work += self.allocation[i]
                        finish[i] = True
                        found_process = True
                        
                        self.steps.append({
                            "step": step_count,
                            "description": f"Process P{i} can complete (request <= work)",
                            "process": i,
                            "request": self.request[i].tolist(),
                            "work_before": (work - self.allocation[i]).tolist(),
                            "work_after": work.tolist(),
                            "finish": finish.copy(),
                            "action": "process_completion"
                        })
                        step_count += 1
                        break
            
            if not found_process:
                # Check for deadlock
                deadlocked_processes = [i for i in range(self.processes) if not finish[i]]
                if deadlocked_processes:
                    self.steps.append({
                        "step": step_count,
                        "description": "No process can complete - DEADLOCK DETECTED",
                        "deadlocked_processes": deadlocked_processes,
                        "work": work.tolist(),
                        "finish": finish.copy(),
                        "action": "deadlock_detected"
                    })
                else:
                    self.steps.append({
                        "step": step_count,
                        "description": "All processes completed - NO DEADLOCK",
                        "work": work.tolist(),
                        "finish": finish.copy(),
                        "action": "no_deadlock"
                    })
        
        return {
            "has_deadlock": any(not f for f in finish),
            "deadlocked_processes": [i for i in range(self.processes) if not finish[i]],
            "steps": self.steps,
            "final_state": {
                "work": work.tolist(),
                "finish": finish
            }
        }
    
    def build_wait_for_graph(self):
        """Build wait-for graph from allocation and request matrices"""
        graph = defaultdict(list)
        
        for i in range(self.processes):
            for j in range(self.resources):
                if self.request[i][j] > 0:
                    # Process i is waiting for resource j
                    # Find who holds resource j
                    for k in range(self.processes):
                        if k != i and self.allocation[k][j] > 0:
                            graph[i].append(k)
        
        return dict(graph)