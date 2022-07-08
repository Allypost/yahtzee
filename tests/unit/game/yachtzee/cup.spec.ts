import {
  test,
} from "@japa/runner";
import {
  equals,
} from "rambdax";
import {
  Cup,
} from "App/Game/Yachtzee/Cup";


const arrayOfLength =
  <T>(length: number, mapFn: (v: never, k: number) => T) =>
    Array.from({ length }, mapFn)
;

test.group("Yachtzee / Cup", () => {
  test("has proper number of dice on init", ({ assert }) => {
    const cup = new Cup();

    const dice = cup.getDice();

    assert.strictEqual(dice.length, Cup.N_DICE);
  });

  test("has 0 rolls on init", ({ assert }) => {
    const cup = new Cup();

    const rolls = cup.getRolls();

    assert.strictEqual(rolls, 0);
  });

  test("can roll at least MAX_ROLLS times", ({ assert, sinon }) => {
    const Math$random = sinon.stub(Math, "random");
    const cup = new Cup();

    let nthRoll = 0;
    for (let i = 0; i < Cup.MAX_ROLLS - 2; i++) {
      nthRoll = cup.roll();
    }
    Math$random.returns(0);
    cup.roll();
    const nextToLastValues = cup.diceValues();

    Math$random.returns(1 - Number.EPSILON);
    nthRoll = cup.roll();
    const lastValues = cup.diceValues();

    assert.strictEqual(Cup.MAX_ROLLS, nthRoll);
    assert.notDeepEqual(nextToLastValues, lastValues);
  });

  test("can roll at most MAX_ROLLS times", ({ assert, sinon }) => {
    const Math$random = sinon.stub(Math, "random");
    const cup = new Cup();

    for (let i = 0; i < Cup.MAX_ROLLS - 1; i++) {
      cup.roll();
    }

    Math$random.returns(0);

    cup.roll();

    const maxRolledDice = cup.diceValues();

    assert.strictEqual(cup.getRolls(), Cup.MAX_ROLLS);

    Math$random.returns(1 - Number.EPSILON);

    cup.roll();

    assert.strictEqual(cup.getRolls(), Cup.MAX_ROLLS);
    assert.deepEqual(maxRolledDice, cup.diceValues());
  });

  test("can re-roll dice", ({ assert, sinon }) => {
    const Math$random = sinon.stub(Math, "random");

    Math$random.returns(0);

    const cup = new Cup();
    const oldDice = cup.diceValues();

    Math$random.returns(1 - Number.EPSILON);

    cup.roll();

    const newDice = cup.diceValues();

    assert.notDeepEqual(oldDice, newDice);
  });

  test("can hold its dice", ({ assert }) => {
    const cup = new Cup();

    const diceHeld = () => cup.getDice().map((die) => die.isHeld());

    assert.isTrue(diceHeld().every(equals(false)));

    const FULL_CUP = arrayOfLength(Cup.N_DICE, (_, i) => i);

    cup.hold(FULL_CUP);

    assert.isTrue(diceHeld().every(equals(true)));
  });

  test("can release its dice", ({ assert }) => {
    const cup = new Cup();

    const FULL_CUP = arrayOfLength(Cup.N_DICE, (_, i) => i);

    const diceHeld = () => cup.getDice().map((die) => die.isHeld());

    cup.hold(FULL_CUP);

    assert.isTrue(diceHeld().every(equals(true)));

    cup.release(FULL_CUP);

    assert.isTrue(diceHeld().every(equals(false)));
  });

  test("can hold part of its dice", ({ assert }) => {
    const cup = new Cup();
    const FIRST_HELD = 1;
    const LAST_HELD = Cup.N_DICE - 2;
    const FULL_CUP = arrayOfLength(Cup.N_DICE, (_, i) => i);
    const PARTIAL_CUP = FULL_CUP.slice(FIRST_HELD, LAST_HELD);

    const diceHeld = () => cup.getDice().map((die) => die.isHeld());

    assert.isTrue(diceHeld().every(equals(false)));

    cup.hold(PARTIAL_CUP);

    const held = diceHeld().slice(FIRST_HELD, LAST_HELD);
    const first = diceHeld().slice(0, FIRST_HELD);
    const last = diceHeld().slice(LAST_HELD);

    assert.isTrue(held.every(equals(true)));
    assert.isTrue(first.every(equals(false)));
    assert.isTrue(last.every(equals(false)));
  });

  test("can release part of its dice", ({ assert }) => {
    const cup = new Cup();
    const FIRST_RELEASED = 1;
    const LAST_RELEASED = Cup.N_DICE - 2;
    const FULL_CUP = arrayOfLength(Cup.N_DICE, (_, i) => i);
    const PARTIAL_CUP = FULL_CUP.slice(FIRST_RELEASED, LAST_RELEASED);

    const diceHeld = () => cup.getDice().map((die) => die.isHeld());

    cup.hold(FULL_CUP);

    assert.isTrue(diceHeld().every(equals(true)));

    cup.release(PARTIAL_CUP);

    {
      const released = diceHeld().slice(FIRST_RELEASED, LAST_RELEASED);
      const first = diceHeld().slice(0, FIRST_RELEASED);
      const last = diceHeld().slice(LAST_RELEASED);

      assert.isTrue(released.every(equals(false)));
      assert.isTrue(first.every(equals(true)));
      assert.isTrue(last.every(equals(true)));
    }
  });

  test("can be reset", ({ assert }) => {
    const cup = new Cup();

    assert.strictEqual(cup.getRolls(), 0);
    cup.roll();
    assert.strictEqual(cup.getRolls(), 1);
    cup.resetRolls();
    assert.strictEqual(cup.getRolls(), 0);
  });

  test("can be made non-resettable", ({ assert }) => {
    const nonResettableCup = new Cup().asNotResettable();

    assert.strictEqual(nonResettableCup.getRolls(), 0);
    nonResettableCup.roll();
    assert.strictEqual(nonResettableCup.getRolls(), 1);
    nonResettableCup.resetRolls();
    assert.strictEqual(nonResettableCup.getRolls(), 1);
  });

  test("non-resettable cup mirrors original roll count", ({ assert }) => {
    const cup = new Cup();
    const nonResettableCup = cup.asNotResettable();

    assert.strictEqual(cup.getRolls(), nonResettableCup.getRolls());
    cup.roll();
    assert.strictEqual(cup.getRolls(), nonResettableCup.getRolls());
    cup.resetRolls();
    assert.strictEqual(cup.getRolls(), nonResettableCup.getRolls());
  });

  test("cup mirrors non-resettable roll count", ({ assert }) => {
    const cup = new Cup();
    const nonResettableCup = cup.asNotResettable();

    assert.strictEqual(cup.getRolls(), nonResettableCup.getRolls());
    nonResettableCup.roll();
    assert.strictEqual(cup.getRolls(), nonResettableCup.getRolls());
  });
});