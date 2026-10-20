import { AGENT_ASSET_BY_STATE, type AgentVisualState } from '../design/agentAssets';

interface MomeAgentProps {
  state: AgentVisualState;
  size?: number;
  label?: string;
  className?: string;
}

export function MomeAgent({ state, size = 84, label = 'Mome Memory Agent', className = '' }: MomeAgentProps) {
  return (
    <img
      src={AGENT_ASSET_BY_STATE[state]}
      alt={label}
      className={`block shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
