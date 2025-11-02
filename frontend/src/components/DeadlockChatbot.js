import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DeadlockChatbot = ({ deadlockDetected, lastDeadlockCycle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! I can explain deadlock concepts. Try asking me about algorithms or detection methods.' }
  ]);
  const [input, setInput] = useState('');

  const responses = {
    'banker': "Banker's Algorithm prevents deadlock by checking if granting a resource request leads to a safe state. It simulates allocation to see if all processes can complete without deadlock.",
    'bankers': "Banker's Algorithm prevents deadlock by checking if granting a resource request leads to a safe state. It simulates allocation to see if all processes can complete without deadlock.",
    'detection': 'Deadlock detection uses a Wait-for Graph to find circular dependencies. When Process A waits for resources held by Process B, and B waits for resources held by A, a cycle forms indicating deadlock.',
    'detected': lastDeadlockCycle ? 
      `The last deadlock was detected using cycle detection. The circular wait was: ${lastDeadlockCycle.join(' → ')}. This means each process was waiting for resources held by the next process in the chain.` :
      'No recent deadlock detected. Deadlock detection works by analyzing resource allocation graphs for circular wait conditions.',
    'prevention': 'Deadlock prevention eliminates one of the four necessary conditions: Mutual Exclusion, Hold and Wait, No Preemption, or Circular Wait. Resource ordering is a common prevention technique.',
    'recovery': 'Deadlock recovery involves breaking existing deadlocks by process termination or resource preemption. The system chooses victims based on priority, cost, or progress made.',
    'circular': 'Circular wait occurs when processes form a chain where each waits for resources held by the next process. This creates a cycle that cannot be resolved without external intervention.',
    'process': 'A process is a program in execution. It has its own memory space, registers, and program counter. The OS manages process creation, scheduling, and termination.',
    'thread': 'Threads are lightweight processes that share memory space. Multiple threads can run within a single process, enabling concurrent execution and better resource utilization.',
    'scheduling': 'CPU scheduling determines which process runs next. Common algorithms include FCFS, SJF, Round Robin, and Priority scheduling. Each has different performance characteristics.',
    'memory': 'Memory management handles RAM allocation. Techniques include paging, segmentation, and virtual memory. The OS ensures processes don\'t interfere with each other\'s memory.',
    'virtual': 'Virtual memory allows processes to use more memory than physically available by swapping pages between RAM and disk storage.',
    'paging': 'Paging divides memory into fixed-size blocks called pages. It enables non-contiguous memory allocation and supports virtual memory systems.',
    'synchronization': 'Process synchronization coordinates access to shared resources using semaphores, mutexes, and monitors to prevent race conditions.',
    'semaphore': 'Semaphores are synchronization primitives that control access to shared resources. They use counters to manage how many processes can access a resource simultaneously.',
    'mutex': 'Mutex (mutual exclusion) ensures only one thread can access a critical section at a time. It\'s a binary semaphore used for thread synchronization.',
    'filesystem': 'File systems organize and manage data storage. They handle file creation, deletion, and access permissions while maintaining directory structures.',
    'interrupt': 'Interrupts are signals that temporarily halt CPU execution to handle urgent events like I/O completion or hardware errors.',
    'kernel': 'The kernel is the core of the OS that manages system resources, provides services to applications, and controls hardware access.',
    'help': 'I can explain OS concepts like: processes, threads, scheduling, memory management, virtual memory, paging, synchronization, semaphores, mutex, file systems, interrupts, kernel, and deadlock topics!'
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { type: 'user', text: input };
    const botResponse = getBotResponse(input.toLowerCase());
    
    setMessages(prev => [...prev, userMessage, { type: 'bot', text: botResponse }]);
    setInput('');
  };

  const getBotResponse = (query) => {
    // Check preset responses first
    for (const [key, response] of Object.entries(responses)) {
      if (query.includes(key)) {
        return response;
      }
    }
    
    // Handle OS-related questions intelligently
    if (query.includes('deadlock') && !query.includes('detection') && !query.includes('prevention')) {
      return 'Deadlock is a situation where processes are permanently blocked, each waiting for resources held by others. Four conditions must exist: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.';
    }
    if (query.includes('cpu') || query.includes('processor')) {
      return 'CPU (Central Processing Unit) executes instructions. The OS manages CPU scheduling using algorithms like Round Robin, FCFS, SJF, and Priority scheduling to allocate CPU time among processes.';
    }
    if (query.includes('ram') || query.includes('memory management')) {
      return 'RAM (Random Access Memory) stores data temporarily. The OS manages memory allocation, deallocation, and protection using techniques like paging, segmentation, and virtual memory.';
    }
    if (query.includes('context switch')) {
      return 'Context switching saves the current process state and loads another process. It involves saving registers, program counter, and memory mappings. Frequent context switches can impact performance.';
    }
    if (query.includes('system call') || query.includes('syscall')) {
      return 'System calls are interfaces between user programs and the kernel. Examples include open(), read(), write(), fork(). They provide controlled access to system resources.';
    }
    if (query.includes('ipc') || query.includes('inter-process')) {
      return 'Inter-Process Communication (IPC) allows processes to exchange data. Methods include pipes, message queues, shared memory, semaphores, and sockets.';
    }
    if (query.includes('fork') || query.includes('exec')) {
      return 'fork() creates a new process by duplicating the current one. exec() replaces the current process image with a new program. Together they enable process creation in Unix-like systems.';
    }
    if (query.includes('cache') || query.includes('buffer')) {
      return 'Caches store frequently accessed data for faster retrieval. The OS manages buffer caches for file I/O and page caches for memory management to improve system performance.';
    }
    if (query.includes('driver') || query.includes('device')) {
      return 'Device drivers are kernel modules that control hardware devices. They provide a standard interface between the OS and hardware, handling device-specific operations.';
    }
    if (query.includes('boot') || query.includes('startup')) {
      return 'The boot process loads the OS into memory. Steps include: BIOS/UEFI → bootloader → kernel loading → init process → system services startup.';
    }
    if (query.includes('shell') || query.includes('command')) {
      return 'The shell is a command-line interface that interprets user commands. It provides features like command history, pipes, redirection, and scripting capabilities.';
    }
    if (query.includes('algorithm') && (query.includes('scheduling') || query.includes('cpu'))) {
      return 'CPU scheduling algorithms: FCFS (First Come First Serve), SJF (Shortest Job First), SRTF (Shortest Remaining Time First), Round Robin, Priority, and Multilevel Queue scheduling.';
    }
    if (query.includes('page') && (query.includes('replacement') || query.includes('algorithm'))) {
      return 'Page replacement algorithms: FIFO (First In First Out), LRU (Least Recently Used), LFU (Least Frequently Used), Optimal, and Clock algorithm for virtual memory management.';
    }
    if (query.includes('disk') && query.includes('scheduling')) {
      return 'Disk scheduling algorithms: FCFS, SSTF (Shortest Seek Time First), SCAN, C-SCAN, LOOK, and C-LOOK optimize disk head movement and reduce seek time.';
    }
    if (query.includes('race') && query.includes('condition')) {
      return 'Race condition occurs when multiple processes access shared data simultaneously. Solutions include locks, semaphores, mutexes, and atomic operations for synchronization.';
    }
    if (query.includes('critical') && query.includes('section')) {
      return 'Critical section is code that accesses shared resources. Only one process can execute in critical section at a time. Managed using locks, semaphores, or monitors.';
    }
    if (query.includes('producer') && query.includes('consumer')) {
      return 'Producer-Consumer problem involves processes that produce/consume data from a shared buffer. Solved using semaphores to coordinate access and prevent buffer overflow/underflow.';
    }
    if (query.includes('dining') && query.includes('philosopher')) {
      return 'Dining Philosophers problem demonstrates deadlock and synchronization. Five philosophers need two forks to eat. Solutions include resource ordering and timeouts.';
    }
    if (query.includes('reader') && query.includes('writer')) {
      return 'Readers-Writers problem allows multiple readers or one writer to access shared data. Solutions prioritize readers, writers, or provide fair access using semaphores.';
    }
    if (query.includes('thrashing')) {
      return 'Thrashing occurs when a system spends more time swapping pages than executing processes. Caused by insufficient memory. Solutions include increasing RAM or reducing multiprogramming.';
    }
    if (query.includes('fragmentation')) {
      return 'Memory fragmentation: External (free memory scattered in small blocks) and Internal (allocated memory larger than needed). Solved by compaction and paging.';
    }
    if (query.includes('spooling')) {
      return 'Spooling (Simultaneous Peripheral Operations Online) queues I/O operations on disk. Commonly used for printing to manage multiple print jobs efficiently.';
    }
    if (query.includes('buffering')) {
      return 'Buffering temporarily stores data during I/O operations. Types include single, double, and circular buffering to improve performance and handle speed differences.';
    }
    if (query.includes('dma') || query.includes('direct memory')) {
      return 'DMA (Direct Memory Access) allows devices to transfer data directly to/from memory without CPU intervention, improving system performance and reducing CPU overhead.';
    }
    if (query.includes('interrupt') && query.includes('handling')) {
      return 'Interrupt handling: CPU saves current state, executes interrupt service routine (ISR), then restores state. Types include hardware, software, and maskable/non-maskable interrupts.';
    }
    if (query.includes('multiprocessing') || query.includes('multicore')) {
      return 'Multiprocessing uses multiple CPUs/cores for parallel execution. Challenges include load balancing, synchronization, and cache coherency. Improves performance and reliability.';
    }
    if (query.includes('multithreading')) {
      return 'Multithreading allows multiple threads within a process. Benefits include parallelism and responsiveness. Challenges include synchronization and thread safety.';
    }
    if (query.includes('virtualization') || query.includes('virtual machine')) {
      return 'Virtualization creates virtual instances of hardware/OS. Types include full virtualization, paravirtualization, and containerization. Enables resource sharing and isolation.';
    }
    if (query.includes('security') || query.includes('protection')) {
      return 'OS security includes authentication, authorization, access control, encryption, and audit trails. Protection mechanisms prevent unauthorized access to system resources.';
    }
    if (query.includes('malware') || query.includes('virus')) {
      return 'Malware includes viruses, worms, trojans, and ransomware. OS protection uses antivirus software, firewalls, sandboxing, and regular security updates.';
    }
    if (query.includes('backup') || query.includes('recovery')) {
      return 'Backup and recovery ensure data protection. Methods include full, incremental, and differential backups. Recovery involves restoring data from backups after failures.';
    }
    if (query.includes('raid')) {
      return 'RAID (Redundant Array of Independent Disks) combines multiple disks for performance and/or redundancy. Levels include RAID 0, 1, 5, 6, and 10 with different characteristics.';
    }
    if (query.includes('network') && query.includes('operating')) {
      return 'Network Operating Systems manage network resources, provide file/print sharing, handle user authentication, and enable distributed computing across multiple machines.';
    }
    if (query.includes('real') && query.includes('time')) {
      return 'Real-time OS guarantees response within specific time constraints. Hard real-time has strict deadlines, soft real-time allows occasional deadline misses.';
    }
    if (query.includes('embedded')) {
      return 'Embedded OS runs on specialized hardware with limited resources. Characteristics include small footprint, real-time capabilities, and power efficiency.';
    }
    if (query.includes('distributed')) {
      return 'Distributed OS manages resources across multiple networked computers, providing transparency, fault tolerance, and scalability for distributed applications.';
    }
    if (query.includes('cloud') || query.includes('saas') || query.includes('paas')) {
      return 'Cloud computing provides on-demand resources. Models include SaaS (Software as a Service), PaaS (Platform as a Service), and IaaS (Infrastructure as a Service).';
    }
    // Specific algorithm responses
    if (query.includes('fcfs') || (query.includes('first') && query.includes('come'))) {
      return 'FCFS (First Come First Serve) is a CPU scheduling algorithm where processes are executed in the order they arrive. Simple but can cause convoy effect with long processes.';
    }
    if (query.includes('sjf') || (query.includes('shortest') && query.includes('job'))) {
      return 'SJF (Shortest Job First) schedules the process with shortest execution time first. Optimal for average waiting time but requires knowing execution times in advance.';
    }
    if (query.includes('round robin') || query.includes('rr')) {
      return 'Round Robin assigns each process a fixed time quantum. When quantum expires, process goes to ready queue end. Good for time-sharing systems with fair CPU allocation.';
    }
    if (query.includes('priority') && query.includes('scheduling')) {
      return 'Priority Scheduling assigns priorities to processes. Higher priority processes execute first. Can cause starvation of low-priority processes without aging.';
    }
    if (query.includes('lru') || (query.includes('least') && query.includes('recently'))) {
      return 'LRU (Least Recently Used) page replacement algorithm removes the page that has not been used for the longest time. Good performance but requires tracking page usage.';
    }
    if (query.includes('fifo') && query.includes('page')) {
      return 'FIFO page replacement removes the oldest page in memory. Simple to implement but can suffer from Belady\'s anomaly where more frames lead to more page faults.';
    }
    if (query.includes('optimal') && query.includes('page')) {
      return 'Optimal page replacement algorithm removes the page that will not be used for the longest time in future. Theoretical best but impossible to implement practically.';
    }
    if (query.includes('lfu') || (query.includes('least') && query.includes('frequently'))) {
      return 'LFU (Least Frequently Used) removes the page with lowest access frequency. Assumes past usage predicts future usage but can be slow to adapt to changes.';
    }
    if (query.includes('scan') && query.includes('disk')) {
      return 'SCAN disk scheduling moves disk head from one end to other, servicing requests along the way. Also called elevator algorithm. Reduces seek time compared to FCFS.';
    }
    if (query.includes('sstf') || (query.includes('shortest') && query.includes('seek'))) {
      return 'SSTF (Shortest Seek Time First) services the request closest to current head position. Reduces seek time but can cause starvation of distant requests.';
    }
    if (query.includes('c-scan') || query.includes('cscan')) {
      return 'C-SCAN (Circular SCAN) moves head from one end to other, then jumps back to beginning. Provides more uniform wait times than SCAN algorithm.';
    }
    if (query.includes('look') && query.includes('disk')) {
      return 'LOOK algorithm is like SCAN but only goes as far as the last request in each direction, then reverses. More efficient than SCAN by avoiding unnecessary head movement.';
    }
    if (query.includes('multilevel') && query.includes('queue')) {
      return 'Multilevel Queue scheduling divides processes into separate queues with different priorities. Each queue can have its own scheduling algorithm.';
    }
    if (query.includes('multilevel') && query.includes('feedback')) {
      return 'Multilevel Feedback Queue allows processes to move between queues based on behavior. Processes using too much CPU time move to lower priority queues.';
    }
    if (query.includes('srtf') || (query.includes('shortest') && query.includes('remaining'))) {
      return 'SRTF (Shortest Remaining Time First) is preemptive version of SJF. If a new process arrives with shorter remaining time, it preempts current process.';
    }
    if (query.includes('aging') && query.includes('priority')) {
      return 'Aging gradually increases the priority of waiting processes to prevent starvation. Ensures that low-priority processes eventually get CPU time.';
    }
    if (query.includes('convoy') && query.includes('effect')) {
      return 'Convoy effect occurs in FCFS when short processes wait behind long processes, like cars behind a slow truck. Increases average waiting time significantly.';
    }
    if (query.includes('belady') && query.includes('anomaly')) {
      return 'Belady\'s Anomaly occurs in FIFO page replacement when increasing the number of page frames actually increases page faults. Violates the expected behavior.';
    }
    
    // Deadlock context
    if (deadlockDetected) {
      return 'A deadlock is currently active in the system! Processes are stuck in a circular wait. You can use Auto Resolve to break the deadlock by terminating a process.';
    }
    
    return 'I can explain any OS concept! Ask about specific algorithms (FCFS, SJF, Round Robin, LRU, FIFO), processes, threads, memory management, file systems, synchronization, deadlocks, or any other operating system topic!';
  };

  return (
    <div className="chatbot-container">
      <motion.button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        🤖 Help
      </motion.button>

      {isOpen && (
        <motion.div
          className="chatbot-window"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="chatbot-header">
            <span>Deadlock Assistant</span>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                {msg.text}
              </div>
            ))}
          </div>
          
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about deadlock concepts..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DeadlockChatbot;