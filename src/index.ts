import { parse } from './read';
import { makeRequestBody, parseResponse } from './write';

type MergeFn<T> = (lhs: T, rhs: T) => T;

type Options<DurableStateT> = {
    host: string;
    address: string;
    password: string;
    initialState: DurableStateT;
    mergeFn: MergeFn<DurableStateT>;
};

export default class CausalSlotClient<DurableStateT> {
    constructor(opt: Options<DurableStateT>) {
        this.#host = opt.host;
        this.#address = opt.address;
        this.#password = opt.password;

        this.#versions = new Set;
        this.#state = opt.initialState;
        this.#mergeFn = opt.mergeFn;
    }

    state(): DurableStateT {
        return this.#state;
    }

    async update(deltaState: DurableStateT) {
        this.#state = this.#mergeFn(this.#state, deltaState);
        this.write(this.#state);
        await this.checkForUpdates();
    }

    async checkForUpdates() {
        this.#state = await this.read();
    }

    private async write(state: DurableStateT) {
        const versions = Array.from(this.#versions);
        const writePayload = JSON.stringify(state);
        const writeResponse = await fetch(`${this.#host}/address/${this.#address}`, {
            method: 'POST',
            mode: 'cors',
            body: makeRequestBody(versions, new TextEncoder().encode(writePayload)),
        });

        if (writeResponse.status !== 200) {
            throw new Error(`Write failed with status ${writeResponse.status}`);
        }


        // We assume that our freshly-written state is causal on all previously-observed versions.
        // Thus, we no longer need to remember the old ones.
        this.#versions.clear();
        this.#versions.add(parseResponse(await writeResponse.arrayBuffer()));
    }

    private async read(): Promise<DurableStateT> {
        const readResponse = await fetch(`${this.#host}/address/${this.#address}`, {
            method: 'GET',
            mode: 'cors',
        });
        const ab = await readResponse.arrayBuffer();

        let v1 = this.#state;
        for (const { vsn, dat } of parse(ab)) {
            const content = JSON.parse(new TextDecoder().decode(dat)) || '{}';
            v1 = v1 === null ? content : this.#mergeFn(v1, content);
            this.#versions.add(vsn);
        }
        return v1;
    }

    #host: string;
    #address: string;
    #password: string;

    #versions: Set<BigInt>;
    #state: DurableStateT;
    #mergeFn: MergeFn<DurableStateT>;
}
