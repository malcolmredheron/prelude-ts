import { LinkedList, ConsLinkedList, EmptyLinkedList } from "../src/LinkedList";
import { typeOf } from "../src/Comparison";
import { HashMap } from "../src/HashMap";
import { Option } from "../src/Option";
import { Stream } from "../src/Stream";
import { MyClass } from "./SampleData";
import * as SeqTest from "./Seq";
import * as assert from 'assert'

SeqTest.runTests("LinkedList",
                 LinkedList.ofIterable,
                 LinkedList.of,
                 LinkedList.empty,
                 LinkedList.unfoldRight,
                 "ConsLinkedList");

describe("LinkedList basics", () => {
    // unfortunately this doesn't work for now (does work on Vector & HashSet)
    // 
    // it("correctly infers the more precise type on allMatch in case of typeguard", () => {
    //     // just checking that this compiles. 'charAt' is available on strings not numbers.
    //     const v = LinkedList.of<string|number>("test","a");
    //     if (v.allMatch(typeOf("string"))) {
    //         v.single().getOrThrow().charAt(0);
    //     }
    // });
})

describe("LinkedList toString", () => {
    it("serializes to string correctly", () => assert.equal(
        "LinkedList(1, 2, 3)", LinkedList.of(1,2,3).toString()));
    it("serializes to string correctly - arrays & strings", () => assert.equal(
        "LinkedList([1,'a'])", LinkedList.of([1,'a']).toString()));
    it("serializes to string correctly - custom toString", () => assert.equal(
        "LinkedList({field1: hi, field2: 99})", LinkedList.of(new MyClass("hi", 99)).toString()));
    it("serializes to string correctly - plain map", () => assert.equal(
        "LinkedList({\"name\":\"hi\",\"age\":99})", LinkedList.of({name:"hi", age:99}).toString()));
    it("takes advantage of isEmpty", () => {
        const list = LinkedList.of(1,2,3);
        if (!list.isEmpty()) {
            list.head().get();
        }
    });
});

describe("static LinkedList.zip", () => {
    const r = LinkedList.zip<[number,string,number]>([1,2], ["a", "b"], LinkedList.of(11,10,9));
    assert.equal(2, r.length());
    // check that the types are properly inferred
    const head: [number,string,number] = r.head().getOrThrow();
    assert.equal(1, head[0]);
    assert.equal("a", head[1]);
    assert.equal(11, head[2]);

    const other = r.get(1).getOrThrow();
    assert.equal(2, other[0]);
    assert.equal("b", other[1]);
    assert.equal(10, other[2]);
});

it("LinkedList returns ConsLinkedList and EmptyLinkedLIst when appropriate", () => {
    function shouldBeEmpty<T>(list: EmptyLinkedList<T>) {}
    function shouldBeCons<T>(list: ConsLinkedList<T>) {}

    // These would make sense but there is some code that does roughly this:
    //   let x = LinkedList.empty();
    //   x = x.append(...); // Fails: x is of type EmptyLinkedList.
    // shouldBeEmpty(LinkedList.of<number>());
    // shouldBeEmpty(LinkedList.empty<number>());

    const empty = LinkedList.of() as EmptyLinkedList<number>;
    const cons = LinkedList.of(0);
    // See the comment in the definition of the LinkedList type for why we call these methods on LinkedList as well.
    const either = LinkedList.of() as LinkedList<number>;

    shouldBeCons(empty.append(0));
    shouldBeCons(cons.append(0));
    either.prepend(0);
    shouldBeCons(empty.prepend(0));
    shouldBeCons(cons.prepend(0));
    either.prepend(0);

    shouldBeEmpty(empty.reverse());
    shouldBeCons(cons.reverse());
    either.reverse();

    shouldBeEmpty(empty.shuffle());
    shouldBeCons(cons.shuffle());
    either.shuffle();

    shouldBeEmpty(empty.map(x => x));
    shouldBeCons(cons.map(x => x));
    either.map(x => x);
    shouldBeEmpty(empty.mapOption(x => Option.of(1)));
    either.mapOption(x => Option.of(1));

    shouldBeEmpty(empty.sortBy(x => 0));
    shouldBeCons(cons.sortBy(x => 0));
    either.sortBy(x=> x);
    shouldBeEmpty(empty.sortOn(x => x));
    shouldBeCons(cons.sortOn(x => x));
    either.sortOn(x => x);

    shouldBeEmpty(empty.distinctBy(x => x));
    shouldBeCons(cons.distinctBy(x => x));
    either.distinctBy(x => x);

    shouldBeEmpty(empty.forEach(x => {}));
    shouldBeCons(cons.forEach(x => {}));
    either.forEach(x=> {});
});