from collections import defaultdict, deque

class WaitForGraph:
    def __init__(self, processes):
        self.processes = processes
        self.graph = defaultdict(list)
        self.in_degree = defaultdict(int)
        
    def add_edge(self, from_process, to_process):
        self.graph[from_process].append(to_process)
        self.in_degree[to_process] += 1
        
    def remove_edge(self, from_process, to_process):
        if to_process in self.graph[from_process]:
            self.graph[from_process].remove(to_process)
            self.in_degree[to_process] -= 1
            
    def detect_deadlock(self):
        # Use DFS to detect cycles
        visited = set()
        rec_stack = set()
        deadlock_cycle = []
        
        def dfs(node, path):
            if node in rec_stack:
                cycle_start = path.index(node)
                return path[cycle_start:]
            
            if node in visited:
                return None
                
            visited.add(node)
            rec_stack.add(node)
            path.append(node)
            
            for neighbor in self.graph[node]:
                cycle = dfs(neighbor, path.copy())
                if cycle:
                    return cycle
                    
            rec_stack.remove(node)
            return None
        
        for process in range(self.processes):
            if process not in visited:
                cycle = dfs(process, [])
                if cycle:
                    return True, cycle
                    
        return False, []
    
    def get_graph_data(self):
        edges = []
        for from_node, to_nodes in self.graph.items():
            for to_node in to_nodes:
                edges.append({"from": from_node, "to": to_node})
        return {"nodes": list(range(self.processes)), "edges": edges}