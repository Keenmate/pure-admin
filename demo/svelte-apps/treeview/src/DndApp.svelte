<script lang="ts">
  import { Tree, uniqueName } from '@keenmate/svelte-treeview';
  import type { LTreeNode, NodeDropContext, NodeTransformContext, NodeEventContext } from '@keenmate/svelte-treeview';

  interface Item {
    id: number;
    path: string;
    name: string;
    icon: string;
    sortOrder: number;
    isDraggable?: boolean;
  }

  // Two independent datasets. "Available" is populated; "Selected" starts with a
  // couple of entries so both directions of a cross-tree drag are demoable.
  let availableData = $state<Item[]>([
    { id: 1, path: '1', name: 'Documents', icon: '📁', sortOrder: 10 },
    { id: 2, path: '1.1', name: 'Roadmap.md', icon: '📄', sortOrder: 10 },
    { id: 3, path: '1.2', name: 'Budget.xlsx', icon: '📊', sortOrder: 20 },
    { id: 4, path: '1.3', name: '🔒 Contract.pdf (pinned)', icon: '📄', sortOrder: 30, isDraggable: false },
    { id: 5, path: '2', name: 'Media', icon: '📁', sortOrder: 20 },
    { id: 6, path: '2.1', name: 'logo.svg', icon: '🎨', sortOrder: 10 },
    { id: 7, path: '2.2', name: 'promo.mp4', icon: '🎬', sortOrder: 20 },
    { id: 8, path: '3', name: 'notes.txt', icon: '📝', sortOrder: 30 }
  ]);

  let selectedData = $state<Item[]>([
    { id: 20, path: '1', name: 'Shared', icon: '📁', sortOrder: 10 },
    { id: 21, path: '1.1', name: 'welcome.md', icon: '📄', sortOrder: 10 }
  ]);

  let availableRef: Tree<Item>;
  let selectedRef: Tree<Item>;

  let selectionMode = $state<'single' | 'multi'>('multi');
  let availableHighlighted = $state(new Set<string>());
  let selectedHighlighted = $state(new Set<string>());

  let activityLog = $state<string[]>([]);
  let nextId = 1000;

  function addLog(message: string) {
    activityLog = [...activityLog.slice(-11), message];
  }

  // Sort by parent, then by the data-driven sortOrder — so a dropped subtree keeps
  // a stable position instead of jumping to the end.
  function sortByOrder(items: LTreeNode<Item>[]) {
    return [...items].sort((a, b) => {
      if (a.parentPath !== b.parentPath) return (a.parentPath || '').localeCompare(b.parentPath || '');
      return (a.data?.sortOrder ?? 0) - (b.data?.sortOrder ?? 0);
    });
  }

  // Paste transform (built-in Ctrl/Cmd+C/X/V): mint a fresh id, let the insert assign
  // the path, and de-collide a root's name against where it lands ("Name Copy 1/2…").
  function transformPasted(data: Item, ctx: NodeTransformContext<Item>): Item {
    const landing =
      ctx.position === 'child' && ctx.target?.node
        ? Object.values(ctx.target.node.children)
        : (ctx.target?.siblings ?? []);
    const taken = landing.map((s) => s.data?.name ?? '');
    return { ...data, id: nextId++, path: '', name: ctx.isRoot ? uniqueName(data.name, taken) : data.name };
  }

  function logDragStart({ node }: NodeEventContext<Item>) {
    addLog(`↖ picked up "${node?.data?.name}"`);
  }

  // A single drop handler shared by both trees. Same-tree drags are auto-handled by
  // the library (move, or Ctrl-drag copy) — we only log them. Cross-tree drags aren't
  // auto-placed (the library can't move nodes that live in another tree), so we copy
  // each dragged subtree into THIS tree via copyNodeWithDescendants.
  //
  //   destTreeId  — the treeId of the tree receiving the drop
  //   destRef     — its Tree ref (has copyNodeWithDescendants)
  //   getSrcRef   — the OTHER tree's ref, to resolve the dragged nodes cross-tree
  //   destLabel   — human label for the log
  function makeDropHandler(
    destTreeId: string,
    destRef: () => Tree<Item>,
    getSrcRef: () => Tree<Item>,
    destLabel: string
  ) {
    return ({ source, target, dragged, position, operation }: NodeDropContext<Item>) => {
      const draggedNode = source.node;
      if (!draggedNode) return;

      // Same-tree — library already did it.
      if (draggedNode.treeId === destTreeId) {
        const verb = operation === 'copy' ? 'copied' : 'moved';
        addLog(`↔ ${verb} "${draggedNode.data?.name}" ${position} "${target?.node?.data?.name ?? 'root'}" (same tree)`);
        return;
      }

      // Cross-tree — place a copy of the full dragged set (already draggable-filtered,
      // so the pinned node is excluded) into this tree.
      const dropNode = target?.node ?? null;
      let parentPath = '';
      let siblingPath: string | undefined;
      let pos: 'before' | 'after' | undefined;
      if (dropNode === null) {
        parentPath = '';
      } else if (position === 'child') {
        parentPath = dropNode.path;
      } else {
        parentPath = dropNode.parentPath || '';
        siblingPath = dropNode.path;
        pos = position as 'before' | 'after';
      }

      const srcRef = getSrcRef();
      let copied = 0;
      let failed = 0;
      let batchSort = 10;
      for (let i = 0; i < dragged.length; i++) {
        const srcNode = srcRef.getNodeByPath(dragged[i].path);
        if (!srcNode) { failed++; continue; }
        const useParent = i === 0 ? parentPath : dropNode ? dropNode.path : '';
        const useSibling = i === 0 ? siblingPath : undefined;
        const usePos = i === 0 ? pos : undefined;
        const rootSort = batchSort;
        batchSort += 10;
        const result = destRef().copyNodeWithDescendants(
          srcNode,
          useParent,
          (data, node) => ({
            ...data,
            id: nextId++,
            path: '',
            sortOrder: node === srcNode ? rootSort : (data.sortOrder || 10)
          }),
          useSibling,
          usePos
        );
        if (result.success) copied += result.count; else failed++;
      }

      if (failed === 0) {
        const label = dragged.length > 1 ? `${dragged.length} items (${copied} nodes)` : `${copied} node(s)`;
        addLog(`⇄ copied ${label} into ${destLabel}`);
      } else {
        addLog(`⚠ ${failed} of ${dragged.length} item(s) failed to copy`);
      }
    };
  }

  const onAvailableDrop = makeDropHandler('dnd-available', () => availableRef, () => selectedRef, 'Available');
  const onSelectedDrop = makeDropHandler('dnd-selected', () => selectedRef, () => availableRef, 'Selected');

  function resetAll() {
    // Re-seed from fresh objects so paths/ids are clean after edits.
    availableData = [
      { id: 1, path: '1', name: 'Documents', icon: '📁', sortOrder: 10 },
      { id: 2, path: '1.1', name: 'Roadmap.md', icon: '📄', sortOrder: 10 },
      { id: 3, path: '1.2', name: 'Budget.xlsx', icon: '📊', sortOrder: 20 },
      { id: 4, path: '1.3', name: '🔒 Contract.pdf (pinned)', icon: '📄', sortOrder: 30, isDraggable: false },
      { id: 5, path: '2', name: 'Media', icon: '📁', sortOrder: 20 },
      { id: 6, path: '2.1', name: 'logo.svg', icon: '🎨', sortOrder: 10 },
      { id: 7, path: '2.2', name: 'promo.mp4', icon: '🎬', sortOrder: 20 },
      { id: 8, path: '3', name: 'notes.txt', icon: '📝', sortOrder: 30 }
    ];
    selectedData = [
      { id: 20, path: '1', name: 'Shared', icon: '📁', sortOrder: 10 },
      { id: 21, path: '1.1', name: 'welcome.md', icon: '📄', sortOrder: 10 }
    ];
    availableHighlighted = new Set();
    selectedHighlighted = new Set();
    addLog('↺ reset both trees');
  }

  function clearSelected() {
    selectedData = [];
    addLog('🗑 cleared Selected tree');
  }
</script>

<div class="pa-row">
  <div class="pa-col-100 pa-col-md-1-3">
    <div class="pa-form-group">
      <label>Selection Mode</label>
      <select class="pa-select" bind:value={selectionMode}>
        <option value="single">single</option>
        <option value="multi">multi (Ctrl/Shift+click)</option>
      </select>
    </div>
  </div>
  <div class="pa-col-100 pa-col-md-2-3 dnd-toolbar">
    <button class="pa-btn pa-btn--secondary pa-btn--sm" onclick={resetAll}>Reset Both</button>
    <button class="pa-btn pa-btn--secondary pa-btn--sm" onclick={clearSelected}>Clear Selected</button>
    <button class="pa-btn pa-btn--secondary pa-btn--sm" onclick={() => (activityLog = [])}>Clear Log</button>
  </div>
</div>

<p class="dnd-hint">
  Drag a node <strong>within</strong> a tree to reorder it (move). Drag a node
  <strong>across</strong> to the other tree to copy its whole subtree in. Ctrl-drag copies
  in place; the 🔒 pinned node can't be grabbed on its own. Keyboard: click a node, then
  <kbd>Ctrl/Cmd</kbd>+<kbd>C</kbd>/<kbd>X</kbd>/<kbd>V</kbd> and <kbd>Delete</kbd>.
</p>

<div class="pa-row">
  <div class="pa-col-100 pa-col-md-50">
    <h4>Available</h4>
    <div class="tree-host">
      <Tree
        bind:this={availableRef}
        treeId="dnd-available"
        data={availableData}
        idMember="id"
        pathMember="path"
        sortCallback={sortByOrder}
        isSorted={true}
        expandLevel={1}
        clickBehavior="select"
        {selectionMode}
        bind:highlightedPaths={availableHighlighted}
        highlightedNodeClass="stv__node-content--highlight-fill"
        dragDropMode="both"
        isCopyAllowed={true}
        getIsDraggableCallback={(node) => node.data?.isDraggable !== false}
        getIsDropAllowedCallback={() => true}
        shouldHandleKeyboardShortcuts={true}
        nodeInputTransformationCallback={transformPasted}
        onNodeDragStart={logDragStart}
        onNodeDrop={onAvailableDrop}
      >
        {#snippet nodeTemplate(node: any)}
          <span>{node.data?.icon} {node.data?.name}</span>
        {/snippet}
      </Tree>
    </div>
  </div>

  <div class="pa-col-100 pa-col-md-50">
    <h4>Selected</h4>
    <div class="tree-host">
      <Tree
        bind:this={selectedRef}
        treeId="dnd-selected"
        data={selectedData}
        idMember="id"
        pathMember="path"
        sortCallback={sortByOrder}
        isSorted={true}
        expandLevel={1}
        clickBehavior="select"
        {selectionMode}
        bind:highlightedPaths={selectedHighlighted}
        highlightedNodeClass="stv__node-content--highlight-fill"
        dragDropMode="both"
        isCopyAllowed={true}
        getIsDraggableCallback={(node) => node.data?.isDraggable !== false}
        getIsDropAllowedCallback={() => true}
        shouldHandleKeyboardShortcuts={true}
        nodeInputTransformationCallback={transformPasted}
        onNodeDragStart={logDragStart}
        onNodeDrop={onSelectedDrop}
        shouldShowDropPlaceholderWhenEmpty={true}
        noDataText="Drop files here"
      >
        {#snippet nodeTemplate(node: any)}
          <span>{node.data?.icon} {node.data?.name}</span>
        {/snippet}
      </Tree>
    </div>
  </div>
</div>

<div class="pa-form-group dnd-log-group">
  <label>Activity Log</label>
  <pre class="state-output dnd-log">{activityLog.length ? activityLog.join('\n') : '(drag a node between the trees…)'}</pre>
</div>

<style>
  .dnd-toolbar {
    display: flex;
    align-items: flex-end;
    gap: 0.8rem;
    flex-wrap: wrap;
  }
  .dnd-hint {
    margin: 0 0 1.2rem 0;
    font-size: 1.3rem;
    color: var(--pa-text-color-2, #6b7280);
  }
  .dnd-hint kbd {
    font-size: 1.1rem;
    padding: 0.1rem 0.4rem;
    border: 1px solid var(--pa-border-color, #e5e7eb);
    border-bottom-width: 2px;
    border-radius: 3px;
    background-color: var(--pa-subtle-bg, #f4f6f9);
  }
  .tree-host {
    height: 32rem;
    overflow: auto;
    border: 1px solid var(--pa-border-color, #e5e7eb);
    border-radius: var(--pa-border-radius, 4px);
    padding: 0.8rem;
    background-color: var(--pa-card-bg, #ffffff);
  }
  .dnd-log-group {
    margin-top: 1.6rem;
  }
  .state-output {
    margin: 0;
    padding: 0.8rem;
    background-color: var(--pa-subtle-bg, #f4f6f9);
    border-radius: var(--pa-border-radius, 4px);
    font-size: 1.2rem;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--pa-text-color-1, #1f2937);
  }
  .dnd-log {
    height: 16rem;
    overflow: auto;
  }
  h4 {
    margin: 0 0 1rem 0;
    color: var(--pa-text-color-1);
  }
</style>
