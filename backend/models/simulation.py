import time
import random
from algorithms.bankers_algorithm import BankersAlgorithm
from algorithms.wait_for_graph import WaitForGraph
from algorithms.deadlock_recovery import DeadlockRecovery

class Simulation:
    def __init__(self, config):
        self.config = config
        self.processes = config['processes']
        self.resources = config['resources']
        self.allocation = config['allocation']
        # Accept both snake_case and camelCase for max need to be robust to frontend payloads
        self.max_need = config.get('max_need') or config.get('maxNeed')
        self.available = config['available']
        self.steps = []
        
    def run(self):
        results = {
            "steps": [],
            "final_state": {},
            "statistics": {},
            "comparison": {}
        }
        
        # Run different strategies
        results["comparison"]["avoidance"] = self._run_avoidance()
        results["comparison"]["detection"] = self._run_detection()
        results["comparison"]["prevention"] = self._run_prevention()
        
        return results
    
    def _run_avoidance(self):
        banker = BankersAlgorithm(
            self.processes,
            self.resources,
            self.allocation,
            self.max_need,
            self.available
        )
        
        is_safe, sequence = banker.is_safe_state()
        
        return {
            "strategy": "Banker's Algorithm (Avoidance)",
            "result": "Safe" if is_safe else "Unsafe",
            "safe_sequence": sequence,
            "pros": ["Prevents deadlock", "Optimal resource utilization"],
            "cons": ["Requires advance knowledge", "Conservative approach"],
            "efficiency": 85 if is_safe else 40
        }
    
    def _run_detection(self):
        # Simulate detection with wait-for graph
        wfg = WaitForGraph(self.processes)
        
        # Create some wait-for relationships
        edges = self._generate_wait_for_edges()
        for edge in edges:
            wfg.add_edge(edge['from'], edge['to'])
        
        has_deadlock, cycle = wfg.detect_deadlock()
        
        return {
            "strategy": "Wait-for Graph (Detection)",
            "result": "Deadlock Detected" if has_deadlock else "No Deadlock",
            "deadlock_cycle": cycle,
            "pros": ["Detects actual deadlocks", "No false positives"],
            "cons": ["Reactive approach", "Recovery overhead"],
            "efficiency": 60 if not has_deadlock else 30
        }
    
    def _run_prevention(self):
        # Simulate prevention strategies
        return {
            "strategy": "Resource Ordering (Prevention)",
            "result": "Deadlock Prevented",
            "method": "Ordered resource allocation",
            "pros": ["Guarantees no deadlock", "Simple implementation"],
            "cons": ["Reduced concurrency", "May cause starvation"],
            "efficiency": 70
        }
    
    def _generate_wait_for_edges(self):
        edges = []
        # Generate some random wait-for relationships
        for i in range(self.processes):
            if random.random() < 0.3:  # 30% chance of waiting
                target = random.randint(0, self.processes - 1)
                if target != i:
                    edges.append({"from": i, "to": target})
        return edges

class GameSimulation:
    def __init__(self):
        self.score = 0
        self.level = 1
        self.processes = []
        self.resources = {"A": 3, "B": 3, "C": 2}
        self.available = {"A": 3, "B": 3, "C": 2}
        
    def generate_request(self):
        process_id = random.randint(0, 4)
        resource_type = random.choice(["A", "B", "C"])
        amount = random.randint(1, 2)
        
        return {
            "process_id": process_id,
            "resource_type": resource_type,
            "amount": amount,
            "timestamp": time.time()
        }
    
    def handle_allocation(self, request, decision):
        if decision == "grant":
            if self.available[request["resource_type"]] >= request["amount"]:
                self.available[request["resource_type"]] -= request["amount"]
                self.score += 10
                return {"success": True, "message": "Resource allocated"}
            else:
                return {"success": False, "message": "Insufficient resources"}
        else:
            self.score += 5  # Points for careful decision
            return {"success": True, "message": "Request denied safely"}
    
    def check_deadlock(self):
        # Simplified deadlock check for game
        return random.random() < 0.1  # 10% chance of deadlock
    
    def get_game_state(self):
        return {
            "score": self.score,
            "level": self.level,
            "available_resources": self.available,
            "active_processes": len(self.processes)
        }