import type { PathNode } from './path-node';

export interface TreeNodePath {
  nodes?: PathNode[];
  level?: number;
  depth?: number;
  pathIds?: number[];
  pathName?: string;
  parentNode?: PathNode;
  rootNode?: PathNode;
  currentNode?: PathNode;
}
