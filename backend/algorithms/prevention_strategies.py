class DeadlockPrevention:
    def __init__(self):
        self.strategies = {
            "mutual_exclusion": self._mutual_exclusion_prevention,
            "hold_and_wait": self._hold_and_wait_prevention,
            "no_preemption": self._no_preemption_prevention,
            "circular_wait": self._circular_wait_prevention
        }
    
    def _mutual_exclusion_prevention(self):
        return {
            "strategy": "Eliminate Mutual Exclusion",
            "description": "Make resources sharable when possible",
            "example": "Use spooling for printers, read-only files",
            "pros": ["Eliminates one deadlock condition"],
            "cons": ["Not applicable to all resources", "May reduce system security"],
            "feasibility": "Limited - many resources are inherently non-sharable",
            "implementation": [
                "Convert exclusive resources to sharable",
                "Use virtualization techniques",
                "Implement resource pooling"
            ]
        }
    
    def _hold_and_wait_prevention(self):
        return {
            "strategy": "Eliminate Hold and Wait",
            "description": "Process must request all resources at once",
            "example": "All-or-nothing resource allocation",
            "pros": ["Prevents deadlock", "Simple to implement"],
            "cons": ["Low resource utilization", "Process starvation possible"],
            "feasibility": "Moderate - causes resource wastage",
            "implementation": [
                "Require processes to request all resources initially",
                "Release all resources before requesting new ones",
                "Use atomic resource allocation"
            ]
        }
    
    def _no_preemption_prevention(self):
        return {
            "strategy": "Allow Preemption",
            "description": "Forcibly take resources from processes",
            "example": "CPU scheduling, memory swapping",
            "pros": ["Prevents deadlock", "Better resource utilization"],
            "cons": ["Work loss", "Complex implementation", "Not suitable for all resources"],
            "feasibility": "Limited - depends on resource type",
            "implementation": [
                "Save process state before preemption",
                "Implement rollback mechanisms",
                "Use priority-based preemption"
            ]
        }
    
    def _circular_wait_prevention(self):
        return {
            "strategy": "Eliminate Circular Wait",
            "description": "Order resources and request in ascending order",
            "example": "Resource numbering system",
            "pros": ["Prevents deadlock", "Relatively easy to implement"],
            "cons": ["Restricts programming flexibility", "May not match natural ordering"],
            "feasibility": "High - most practical prevention method",
            "implementation": [
                "Assign unique numbers to all resources",
                "Processes must request resources in ascending order",
                "Release resources in descending order"
            ]
        }
    
    def simulate_resource_ordering(self, processes, resources, requests):
        """Simulate circular wait prevention using resource ordering"""
        steps = []
        resource_order = {f"R{i}": i for i in range(resources)}
        
        for proc_id, proc_requests in enumerate(requests):
            # Sort requests by resource order
            sorted_requests = sorted(proc_requests, key=lambda x: resource_order[x['resource']])
            
            steps.append({
                "process": f"P{proc_id}",
                "original_requests": proc_requests,
                "ordered_requests": sorted_requests,
                "explanation": f"P{proc_id} requests reordered according to resource numbering"
            })
        
        return {
            "strategy": "Resource Ordering",
            "resource_order": resource_order,
            "simulation_steps": steps,
            "result": "Circular wait eliminated - no deadlock possible"
        }
    
    def get_all_strategies(self):
        """Return detailed information about all prevention strategies"""
        return {name: strategy() for name, strategy in self.strategies.items()}
    
    def compare_strategies(self):
        """Compare all prevention strategies"""
        strategies = self.get_all_strategies()
        
        comparison = {
            "effectiveness": {
                "mutual_exclusion": 2,  # Low
                "hold_and_wait": 3,     # Medium
                "no_preemption": 3,     # Medium
                "circular_wait": 4      # High
            },
            "practicality": {
                "mutual_exclusion": 2,
                "hold_and_wait": 3,
                "no_preemption": 2,
                "circular_wait": 4
            },
            "resource_utilization": {
                "mutual_exclusion": 4,
                "hold_and_wait": 2,
                "no_preemption": 3,
                "circular_wait": 3
            }
        }
        
        return {
            "strategies": strategies,
            "comparison_metrics": comparison,
            "recommendation": "circular_wait",
            "reasoning": "Best balance of effectiveness and practicality"
        }