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

test('State subscribe should not work when using the state target', (done) => {
    const { state, subscribe, target } = tates<{ test: any; }>();
    const handler = jest.fn(noop);
    const handler2 = jest.fn(noop);

    subscribe(handler, 'test');
    subscribe(handler2, 'test.key');

    const stateValue = target();

    stateValue.test = true;
    stateValue.test = false;
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
    stateValue.test = obj;

    setTimeout(() => {
        expect(handler).toBeCalledTimes(1);
        expect(handler).nthCalledWith(1, undefined, 'test');

        expect(handler2).toBeCalledTimes(1);
        expect(handler2).nthCalledWith(1, undefined, 'test.key');

        expect(state).toEqual(stateValue);
        done();
    }, 100);
});

test('State subscribe should not work when using a cloned state', (done) => {
    const { state, subscribe, clone } = tates<{ test: any; }>();
    const handler = jest.fn(noop);
    const handler2 = jest.fn(noop);

    subscribe(handler, 'test');
    subscribe(handler2, 'test.key');

    const stateValue = clone();

    stateValue.test = true;
    stateValue.test = false;
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
    stateValue.test = obj;

    setTimeout(() => {
        expect(handler).toBeCalledTimes(1);
        expect(handler).nthCalledWith(1, undefined, 'test');

        expect(handler2).toBeCalledTimes(1);
        expect(handler2).nthCalledWith(1, undefined, 'test.key');

        expect(state).not.toEqual(stateValue);
        done();
    }, 100);
});

test('State subscribe should not work when using a cloned state with a specific prop', (done) => {
    const { state, subscribe, clone } = tates<{ test: any; }>();
    const handler = jest.fn(noop);
    const handler2 = jest.fn(noop);

    subscribe(handler, 'test');
    subscribe(handler2, 'test.key');

    state.test = true;
    state.test = false;

    const stateValue = clone('test');
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

    const stateValue2 = clone('test');
    stateValue2.key = 'number';

    setTimeout(() => {
        expect(handler).toBeCalledTimes(1);
        expect(handler).nthCalledWith(1, obj, 'test');

        expect(handler2).toBeCalledTimes(1);
        expect(handler2).nthCalledWith(1, obj.key, 'test.key');

        expect(state.test).not.toEqual(stateValue);
        expect(stateValue).toBe(false);
        expect(state.test.value).toEqual(stateValue2.value);
        expect(state.test).not.toEqual(stateValue2);
        done();
    }, 100);
});

test('Cloning different values on state should end up in multiple unique copies', (done) => {
    const { state, subscribe, clone } = tates<any>();
    const handler = jest.fn(noop);
    const handler2 = jest.fn(noop);

    subscribe(handler, 'test');
    subscribe(handler2, 'test.message');

    const test = {
        message: 'Hello World!'
    };

    state.test = test;

    const stateClone = clone();
    const testClone = clone('test');
    const messageClone = clone('test.message');

    expect(stateClone).toEqual({ test });
    expect(testClone).toEqual(test);
    expect(messageClone).toEqual(test.message);
    expect(testClone).not.toBe(test);

    state.test = 'Goodbye';

    setTimeout(() => {
        expect(handler).toBeCalledTimes(1);
        expect(handler).nthCalledWith(1, state.test, 'test');

        expect(handler2).toBeCalledTimes(1);
        expect(handler2).nthCalledWith(1, undefined, 'test.message');

        expect(stateClone).not.toEqual(state);
        expect(testClone).not.toEqual(state.test);
        done();
    }, 100);
});
