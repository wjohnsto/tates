import { createState } from '../src/';

test('Tests basic state', (done) => {
    const { state, subscribe } = createState<{ test: boolean; }>();

    subscribe((value: boolean, prop: string) => {
        expect(value).toBe(true);
        expect(prop).toEqual('test');
        done();
    }, 'test');

    state.test = true;
});
