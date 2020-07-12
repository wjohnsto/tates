import tates from '../src';
import noop from 'lodash/noop';

test('State subscribe should debounce for subsequent calls', (done) => {
    const { state, subscribe } = tates<{ test: any; }>();
    const handler = jest.fn(noop);
    const handler2 = jest.fn(noop);

    subscribe(handler, 'test');
    subscribe(handler2, 'test.key');

    state.test = true;
    state.test = false;
    const obj = {
        key: 'string',
        value: {
            a: {
                b: {
                    c: 2
                }
            }
        }
    };
    state.test = obj;

    setTimeout(() => {
        expect(handler).toBeCalledTimes(1);
        expect(handler).nthCalledWith(1, obj, 'test');

        expect(handler2).toBeCalledTimes(1);
        expect(handler2).nthCalledWith(1, obj.key, 'test.key');
        expect(state.test).not.toBe(obj);
        expect(state.test).toEqual(obj);

        expect(state.test.value.a).not.toBe(obj.value.a);
        expect(state.test.value.a).toEqual(obj.value.a);
        done();
    }, 100);
});

test('State subscribe should honor unsubscribe', (done) => {
    const { state, subscribe } = tates<{ test: any; }>();
    const handler = jest.fn(noop);
    const handler2 = jest.fn(noop);

    const unsubH1 = subscribe(handler, 'test');
    subscribe(handler2, 'test.key');

    state.test = true;
    state.test = false;
    const obj = {
        key: 'string',
        value: {
            a: {
                b: {
                    c: 2
                }
            }
        }
    };
    state.test = obj;

    unsubH1();
    setTimeout(() => {
        expect(handler).toBeCalledTimes(0);

        expect(handler2).toBeCalledTimes(1);
        expect(handler2).nthCalledWith(1, obj.key, 'test.key');
        done();
    }, 100);
});

test('State subscribe should allow no debounce and notify for every state update', (done) => {
    const { state, subscribe } = tates<{ test: any; }>({
        debounce: false,
    });
    const handler = jest.fn(noop);
    const handler2 = jest.fn(noop);

    subscribe(handler, 'test');
    subscribe(handler2, 'test.key');

    state.test = true;
    state.test = false;
    const obj = {
        key: 'string',
        value: {
            a: {
                b: {
                    c: 2
                }
            }
        }
    };
    state.test = obj;

    setTimeout(() => {
        expect(handler).toBeCalledTimes(4);
        expect(handler).nthCalledWith(1, undefined, 'test');
        expect(handler).nthCalledWith(2, true, 'test');
        expect(handler).nthCalledWith(3, false, 'test');
        expect(handler).nthCalledWith(4, obj, 'test');

        expect(handler2).toBeCalledTimes(2);
        expect(handler2).nthCalledWith(1, undefined, 'test.key');
        expect(handler2).nthCalledWith(2, obj.key, 'test.key');
        expect(state.test).not.toBe(obj);
        expect(state.test).toEqual(obj);

        expect(state.test.value.a).not.toBe(obj.value.a);
        expect(state.test.value.a).toEqual(obj.value.a);
        done();
    }, 100);
});

test('State subscribe should honor unsubscribing with no debounce', (done) => {
    const { state, subscribe } = tates<{ test: any; }>({
        debounce: false,
    });
    const handler = jest.fn(noop);
    const handler2 = jest.fn(noop);

    const unsubH1 = subscribe(handler, 'test');
    subscribe(handler2, 'test.key');

    state.test = true;
    state.test = false;
    const obj = {
        key: 'string',
        value: {
            a: {
                b: {
                    c: 2
                }
            }
        }
    };
    state.test = obj;

    unsubH1();

    setTimeout(() => {
        expect(handler).toBeCalledTimes(0);
        expect(handler2).toBeCalledTimes(2);
        done();
    }, 100);
});
