# Causal Slot TypeScript Client

TypeScript client for [CausalSlot](https://github.com/JKoff/CausalSlot).

## Prerequisites

- TypeScript (`npm install -g typescript`)

## Instructions

Compile the library to the dist directory by running `tsc` in this directory.

```typescript
import CausalSlotClient from '../src/index';

type State = {
    items: string[];  // Append-only set
};

const client = new CausalSlotClient<State>({
    host: 'http://127.0.0.1:8081',
    address: '1005e1eaf',
    password: 'bosco',
    initialState: { items: [] },
    mergeFn: (lhs: State, rhs: State): State => {
        const lhsSet = new Set(lhs.items || []);
        (rhs.items || []).forEach(item => lhsSet.add(item));
        return { items: Array.from(lhsSet) };
    }
});

newLink.addEventListener('click', async e => {
    e.preventDefault();
    const itemName = window.prompt('Enter item name') || 'Name not provided';
    csClient.update({ items: [itemName] });
    render(csClient.state());
});

csClient.checkForUpdates().then(() => render(csClient.state()));
```

See sample-app directory for a working example.
