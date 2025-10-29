import random

class DeadlockRecovery:
    def __init__(self, processes, resources, allocation):
        self.processes = processes
        self.resources = resources
        self.allocation = allocation
        
    def process_termination(self, deadlock_cycle):
        # Select process to terminate based on priority/cost
        strategies = {
            "lowest_priority": self._terminate_lowest_priority,
            "least_resources": self._terminate_least_resources,
            "random": self._terminate_random
        }
        
        results = {}
        for strategy, method in strategies.items():
            results[strategy] = method(deadlock_cycle)
            
        return results
    
    def _terminate_lowest_priority(self, cycle):
        # Simulate priority-based termination
        terminated = min(cycle)  # Assume lower ID = lower priority
        return {
            "terminated_process": terminated,
            "reason": "Lowest priority process",
            "cost": self._calculate_termination_cost(terminated)
        }
    
    def _terminate_least_resources(self, cycle):
        # Terminate process holding least resources
        min_resources = float('inf')
        target_process = cycle[0]
        
        for process in cycle:
            resource_count = sum(self.allocation[process])
            if resource_count < min_resources:
                min_resources = resource_count
                target_process = process
                
        return {
            "terminated_process": target_process,
            "reason": "Holds least resources",
            "cost": self._calculate_termination_cost(target_process)
        }
    
    def _terminate_random(self, cycle):
        terminated = random.choice(cycle)
        return {
            "terminated_process": terminated,
            "reason": "Random selection",
            "cost": self._calculate_termination_cost(terminated)
        }
    
    def resource_preemption(self, deadlock_cycle, available):
        # Preempt resources from processes in cycle
        preemption_plan = []
        
        for process in deadlock_cycle:
            preemptable = []
            for i, count in enumerate(self.allocation[process]):
                if count > 0:
                    preemptable.append({
                        "resource_type": i,
                        "amount": count,
                        "preemption_cost": count * (process + 1)  # Simple cost model
                    })
            
            if preemptable:
                preemption_plan.append({
                    "process": process,
                    "preemptable_resources": preemptable
                })
        
        return preemption_plan
    
    def _calculate_termination_cost(self, process):
        # Simple cost calculation based on resources held
        return sum(self.allocation[process]) * 10