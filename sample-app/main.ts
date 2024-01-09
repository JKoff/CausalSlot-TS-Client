import CausalSlotClient from '../src/index';

type State = {
    items: string[];  // Append-only set
};

const csClient = new CausalSlotClient<State>({
    host: (document.querySelector('#host') as HTMLInputElement).value,
    address: (document.querySelector('#address') as HTMLInputElement).value,
    initialState: { items: [] },
    mergeFn: (lhs: State, rhs: State): State => {
        const lhsSet = new Set(lhs.items || []);
        (rhs.items || []).forEach(item => lhsSet.add(item));
        return { items: Array.from(lhsSet) };
    }
});

function render() {
    const newLink = document.createElement('a');
    newLink.addEventListener('click', async e => {
        e.preventDefault();
        const itemName = window.prompt('Enter item name') || 'Name not provided';
        csClient.update({ items: [itemName] });
        render();
    });
    newLink.innerHTML = 'Add item';

    const makeText = (text: string) => document.createTextNode(text);
    const makeSpan = (text: string) => {
        const span = document.createElement('span');
        span.appendChild(makeText(text));
        return span;
    };

    const makeList = (items: IterableIterator<string>) => {
        const ul = document.createElement('ul');
        ul.id = 'list';
        for (const item of items) {
            ul.appendChild(makeItem(makeSpan(item)));
        }
        ul.appendChild(newLink);
        return ul;
    };

    const makeItem = (el: HTMLElement) => {
        const li = document.createElement('li');
        li.appendChild(el);
        return li;
    };

    const list = document.querySelector('#list');
    if (!list) {
        throw new Error('List not found');
    }

    list.replaceWith(makeList(csClient.state().items.values()));
}

csClient.checkForUpdates().then(render);
