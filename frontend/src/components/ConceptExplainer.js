import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ConceptExplainer = () => {
  const [selectedConcept, setSelectedConcept] = useState('deadlock');

  const concepts = {
    deadlock: {
      title: "What is Deadlock?",
      definition: "A deadlock is a situation where two or more processes are unable to proceed because each is waiting for the other to release resources.",
      conditions: [
        "Mutual Exclusion: Resources cannot be shared",
        "Hold and Wait: Process holds resources while waiting for others",
        "No Preemption: Resources cannot be forcibly taken",
        "Circular Wait: Circular chain of processes waiting for resources"
      ],
      example: "Process A holds Resource 1 and waits for Resource 2, while Process B holds Resource 2 and waits for Resource 1.",
      realWorld: "Like two cars blocking each other at a narrow bridge - neither can proceed until the other moves first."
    },
    avoidance: {
      title: "Deadlock Avoidance",
      definition: "Preventing deadlock by carefully analyzing resource requests before granting them.",
      algorithm: "Banker's Algorithm",
      howItWorks: [
        "Maintain information about maximum resource needs",
        "Check if granting a request leads to a safe state",
        "Only grant requests that keep the system in a safe state",
        "A safe state means there exists a sequence where all processes can complete"
      ],
      advantages: ["Prevents deadlock completely", "Optimal resource utilization"],
      disadvantages: ["Requires advance knowledge of maximum needs", "Conservative approach"]
    },
    detection: {
      title: "Deadlock Detection",
      definition: "Allowing deadlock to occur but detecting it when it happens.",
      algorithm: "Wait-for Graph & Detection Algorithm",
      howItWorks: [
        "Build a wait-for graph showing process dependencies",
        "Look for cycles in the graph",
        "If cycle exists, deadlock is present",
        "Use resource allocation matrices to find blocked processes"
      ],
      advantages: ["No need for advance information", "Detects actual deadlocks"],
      disadvantages: ["Reactive approach", "Recovery overhead required"]
    },
    prevention: {
      title: "Deadlock Prevention",
      definition: "Eliminating one of the four necessary conditions for deadlock.",
      strategies: [
        "Eliminate Mutual Exclusion: Make resources sharable",
        "Eliminate Hold and Wait: Request all resources at once",
        "Allow Preemption: Forcibly take resources when needed",
        "Eliminate Circular Wait: Order resources and request in sequence"
      ],
      mostPractical: "Resource Ordering (Circular Wait Prevention)",
      advantages: ["Guarantees no deadlock", "Simple to understand"],
      disadvantages: ["May reduce system efficiency", "Restricts programming flexibility"]
    },
    recovery: {
      title: "Deadlock Recovery",
      definition: "Breaking deadlock after it has been detected.",
      methods: [
        "Process Termination: Kill one or more processes",
        "Resource Preemption: Take resources from processes",
        "Rollback: Return processes to previous safe state"
      ],
      considerations: [
        "Which process to terminate?",
        "Minimize cost of recovery",
        "Prevent starvation",
        "Handle partial work loss"
      ],
      advantages: ["Handles deadlock after occurrence"],
      disadvantages: ["Work loss", "Complex recovery decisions"]
    }
  };

  const concept = concepts[selectedConcept];

  return (
    <div className="concept-explainer card">
      <div className="concept-tabs">
        {Object.keys(concepts).map((key) => (
          <button
            key={key}
            className={`concept-tab ${selectedConcept === key ? 'active' : ''}`}
            onClick={() => setSelectedConcept(key)}
          >
            {concepts[key].title}
          </button>
        ))}
      </div>

      <motion.div
        key={selectedConcept}
        className="concept-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3>{concept.title}</h3>
        
        <div className="concept-definition">
          <h4>Definition</h4>
          <p>{concept.definition}</p>
        </div>

        {concept.conditions && (
          <div className="concept-section">
            <h4>Necessary Conditions</h4>
            <ul>
              {concept.conditions.map((condition, index) => (
                <li key={index}>{condition}</li>
              ))}
            </ul>
          </div>
        )}

        {concept.algorithm && (
          <div className="concept-section">
            <h4>Key Algorithm</h4>
            <p><strong>{concept.algorithm}</strong></p>
          </div>
        )}

        {concept.howItWorks && (
          <div className="concept-section">
            <h4>How It Works</h4>
            <ol>
              {concept.howItWorks.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {concept.strategies && (
          <div className="concept-section">
            <h4>Prevention Strategies</h4>
            <ul>
              {concept.strategies.map((strategy, index) => (
                <li key={index}>{strategy}</li>
              ))}
            </ul>
            {concept.mostPractical && (
              <p><strong>Most Practical:</strong> {concept.mostPractical}</p>
            )}
          </div>
        )}

        {concept.methods && (
          <div className="concept-section">
            <h4>Recovery Methods</h4>
            <ul>
              {concept.methods.map((method, index) => (
                <li key={index}>{method}</li>
              ))}
            </ul>
          </div>
        )}

        {concept.considerations && (
          <div className="concept-section">
            <h4>Key Considerations</h4>
            <ul>
              {concept.considerations.map((consideration, index) => (
                <li key={index}>{consideration}</li>
              ))}
            </ul>
          </div>
        )}

        {concept.advantages && (
          <div className="pros-cons-section">
            <div className="pros">
              <h4>✅ Advantages</h4>
              <ul>
                {concept.advantages.map((advantage, index) => (
                  <li key={index}>{advantage}</li>
                ))}
              </ul>
            </div>
            
            {concept.disadvantages && (
              <div className="cons">
                <h4>❌ Disadvantages</h4>
                <ul>
                  {concept.disadvantages.map((disadvantage, index) => (
                    <li key={index}>{disadvantage}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {concept.example && (
          <div className="concept-example">
            <h4>Example</h4>
            <p>{concept.example}</p>
          </div>
        )}

        {concept.realWorld && (
          <div className="concept-analogy">
            <h4>Real-World Analogy</h4>
            <p>{concept.realWorld}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ConceptExplainer;