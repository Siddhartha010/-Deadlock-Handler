import numpy as np

class BankersAlgorithm:
    def __init__(self, processes, resources, allocation, max_need, available):
        self.processes = processes
        self.resources = resources
        self.allocation = np.array(allocation)
        self.max_need = np.array(max_need)
        self.available = np.array(available)
        self.need = self.max_need - self.allocation
        self.steps = []
        
    def is_safe_state(self, step_by_step=False):
        work = self.available.copy()
        finish = [False] * self.processes
        safe_sequence = []
        self.steps = []
        
        if step_by_step:
            self.steps.append({
                "step": 0,
                "description": "Initialize Work = Available",
                "work": work.tolist(),
                "finish": finish.copy(),
                "safe_sequence": [],
                "action": "initialization"
            })
        
        step_count = 1
        while len(safe_sequence) < self.processes:
            found = False
            for i in range(self.processes):
                if not finish[i] and all(self.need[i] <= work):
                    if step_by_step:
                        self.steps.append({
                            "step": step_count,
                            "description": f"Process P{i} can execute (Need <= Work)",
                            "process": i,
                            "need": self.need[i].tolist(),
                            "work_before": work.tolist(),
                            "work_after": (work + self.allocation[i]).tolist(),
                            "finish": finish.copy(),
                            "safe_sequence": safe_sequence.copy(),
                            "action": "process_execution"
                        })
                    
                    work += self.allocation[i]
                    finish[i] = True
                    safe_sequence.append(i)
                    found = True
                    step_count += 1
                    break
            
            if not found:
                if step_by_step:
                    self.steps.append({
                        "step": step_count,
                        "description": "No process can execute - UNSAFE STATE",
                        "work": work.tolist(),
                        "finish": finish.copy(),
                        "safe_sequence": safe_sequence.copy(),
                        "action": "unsafe_state"
                    })
                return False, []
        
        if step_by_step:
            self.steps.append({
                "step": step_count,
                "description": "All processes completed - SAFE STATE",
                "work": work.tolist(),
                "finish": finish.copy(),
                "safe_sequence": safe_sequence.copy(),
                "action": "safe_state"
            })
        
        return True, safe_sequence
    
    def request_resources(self, process_id, request):
        request = np.array(request)
        
        if any(request > self.need[process_id]):
            return False, "Request exceeds maximum need"
        
        if any(request > self.available):
            return False, "Request exceeds available resources"
        
        # Temporarily allocate resources
        self.available -= request
        self.allocation[process_id] += request
        self.need[process_id] -= request
        
        is_safe, sequence = self.is_safe_state()
        
        if is_safe:
            return True, f"Request granted. Safe sequence: {sequence}"
        else:
            # Rollback allocation
            self.available += request
            self.allocation[process_id] -= request
            self.need[process_id] += request
            return False, "Request would lead to unsafe state"