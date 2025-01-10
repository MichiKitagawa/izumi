//src/components/AIResult.tsx
import React from 'react';

interface AIResultProps {
  result: string;
}

const AIResult: React.FC<AIResultProps> = ({ result }) => {
  return (
    <div>
      <h2>AI Processing Result</h2>
      <p>{result}</p>
    </div>
  );
};

export default AIResult;
