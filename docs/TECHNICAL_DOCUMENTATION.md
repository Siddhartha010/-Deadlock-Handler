# Technical Documentation

## Architecture Overview

### System Components
```
┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Flask Backend  │
│                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Components  │ │    │ │ Algorithms  │ │
│ │ Pages       │ │◄──►│ │ API         │ │
│ │ Utils       │ │    │ │ Models      │ │
│ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: React 18, Framer Motion, Recharts, Axios
- **Backend**: Flask, NumPy, Pandas, Matplotlib
- **Styling**: CSS3 with animations and responsive design
- **Communication**: RESTful API with JSON

## Backend Architecture

### Core Algorithms

#### Banker's Algorithm (`bankers_algorithm.py`)
```python
class BankersAlgorithm:
    def __init__(self, processes, resources, allocation, max_need, available)
    def is_safe_state(self) -> (bool, list)
    def request_resources(self, process_id, request) -> (bool, str)
```

**Key Features:**
- Safe state checking using work and finish arrays
- Resource request validation
- Rollback mechanism for unsafe allocations

#### Wait-for Graph (`wait_for_graph.py`)
```python
class WaitForGraph:
    def __init__(self, processes)
    def add_edge(self, from_process, to_process)
    def detect_deadlock(self) -> (bool, list)
```

**Algorithm:** Depth-First Search (DFS) for cycle detection
- Time Complexity: O(V + E)
- Space Complexity: O(V)

#### Recovery Methods (`deadlock_recovery.py`)
```python
class DeadlockRecovery:
    def process_termination(self, deadlock_cycle) -> dict
    def resource_preemption(self, deadlock_cycle, available) -> list
```

**Strategies:**
- Lowest priority termination
- Least resources termination
- Random termination
- Resource preemption with cost calculation

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bankers` | POST | Run Banker's algorithm |
| `/api/request-resources` | POST | Process resource request |
| `/api/detect-deadlock` | POST | Detect deadlock using wait-for graph |
| `/api/recovery-options` | POST | Get recovery strategies |
| `/api/simulate` | POST | Run full simulation |

### Data Models

#### Request Format
```json
{
  "processes": 5,
  "resources": 3,
  "allocation": [[0,1,0], [2,0,0], [3,0,2], [2,1,1], [0,0,2]],
  "max_need": [[7,5,3], [3,2,2], [9,0,2], [2,2,2], [4,3,3]],
  "available": [3,3,2]
}
```

#### Response Format
```json
{
  "is_safe": true,
  "safe_sequence": [1, 3, 4, 0, 2],
  "current_state": {
    "allocation": [...],
    "need": [...],
    "available": [...]
  }
}
```

## Frontend Architecture

### Component Hierarchy
```
App
├── Header
├── Home
├── Simulation
│   ├── ProcessVisualizer
│   ├── ResourceMatrix
│   ├── AlgorithmSelector
│   └── ResultsPanel
├── GameMode
│   ├── GameStats
│   ├── ResourceRequest
│   └── GameVisualization
└── Dashboard
```

### State Management
- Local component state using React hooks
- Props drilling for data sharing
- API calls managed in utility functions

### Animation System
- **Framer Motion** for component animations
- **CSS animations** for visual effects
- **Responsive design** with media queries

### Key Components

#### ProcessVisualizer
- Displays process states with color coding
- Animates safe sequence execution
- Shows resource allocation per process

#### ResourceMatrix
- Interactive input matrices
- Real-time validation
- Dynamic sizing based on configuration

#### GameVisualization
- Real-time system state display
- Animated resource requests
- Visual feedback for decisions

## Performance Considerations

### Backend Optimization
- NumPy arrays for matrix operations
- Efficient graph algorithms
- Minimal memory allocation

### Frontend Optimization
- Component memoization where appropriate
- Lazy loading for large datasets
- Optimized re-renders

### Scalability
- Supports up to 20 processes and 10 resource types
- Configurable timeout for game requests
- Efficient state updates

## Security Considerations

### Input Validation
- Server-side validation of all inputs
- Range checking for matrix values
- Type validation for API requests

### Error Handling
- Graceful degradation for API failures
- User-friendly error messages
- Logging for debugging

## Testing Strategy

### Unit Tests
- Algorithm correctness verification
- Edge case handling
- Input validation testing

### Integration Tests
- API endpoint testing
- Frontend-backend communication
- End-to-end user workflows

### Performance Tests
- Large matrix handling
- Concurrent request processing
- Memory usage monitoring

## Deployment

### Development Setup
1. Install Python 3.8+ and Node.js 16+
2. Run `setup.bat` for automated installation
3. Start backend: `python backend/app.py`
4. Start frontend: `npm start` in frontend directory

### Production Considerations
- Use production WSGI server (Gunicorn)
- Build optimized React bundle
- Configure CORS for production domains
- Set up proper logging and monitoring

## Future Enhancements

### Planned Features
- Multi-user collaborative simulations
- Advanced visualization with D3.js
- Machine learning for optimal strategies
- Mobile app version

### Technical Improvements
- WebSocket for real-time updates
- Database integration for persistence
- Microservices architecture
- Container deployment with Docker

## Code Quality

### Standards
- PEP 8 for Python code
- ESLint for JavaScript
- Consistent naming conventions
- Comprehensive documentation

### Best Practices
- Separation of concerns
- DRY principle adherence
- Error boundary implementation
- Accessibility compliance