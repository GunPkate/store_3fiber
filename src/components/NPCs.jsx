import { engine, useUiStore } from '../state/uiStore.js';
import NPCAvatar from './NPCAvatar.jsx';

export default function NPCs() {
  // subscribing to npcVersion forces this list to re-render whenever an
  // NPC is spawned or removed; per-frame position updates happen inside
  // each NPCAvatar's own useFrame, not here.
  useUiStore((s) => s.npcVersion);
  return (
    <group>
      {engine.npcs.map((npc) => (
        <NPCAvatar key={npc.id} npc={npc} />
      ))}
    </group>
  );
}
