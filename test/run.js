var types = require("../lib/types");
var n = types.namedTypes;
var b = types.builders;

require("../lib/core");

exports.testBasic = function(t, assert) {
    var fooId = b.identifier("foo");
    var ifFoo = b.ifStatement(fooId, b.blockStatement([
        b.expressionStatement(b.callExpression(fooId, []))
    ]));

    assert.ok(n.IfStatement.check(ifFoo));
    assert.ok(n.Statement.check(ifFoo));
    assert.ok(n.Node.check(ifFoo));

    assert.ok(n.BlockStatement.check(ifFoo.consequent));
    assert.strictEqual(
        ifFoo.consequent.body[0].expression.arguments.length,
        0);

    assert.strictEqual(ifFoo.test, fooId);
    assert.ok(n.Expression.check(ifFoo.test));
    assert.ok(n.Identifier.check(ifFoo.test));
    assert.ok(!n.Statement.check(ifFoo.test));

    t.finish();
};

exports.testIsSupertypeOf = function(t, assert) {
    var def = types.Type.def;

    assert.ok(def("Node").isSupertypeOf(def("Node")));
    assert.ok(def("Node").isSupertypeOf(def("Expression")));
    assert.ok(!def("Expression").isSupertypeOf(def("Node")));
    assert.ok(!def("Expression").isSupertypeOf(
        def("DebuggerStatement")));

    // TODO Make this test case more exhaustive.

    t.finish();
};

exports.testShallowAndDeepChecks = function(t, assert) {
    var index = b.identifier("foo");
    var decl = b.variableDeclaration(
        "var", [b.variableDeclarator(
            index, b.literal(42))]);

    assert.ok(n.Node.check(decl));
    assert.ok(n.Statement.check(decl));
    assert.ok(n.Declaration.check(decl));
    assert.ok(n.VariableDeclaration.check(decl));

    assert.ok(n.Node.check(decl, true));
    assert.ok(n.Statement.check(decl, true));
    assert.ok(n.Declaration.check(decl, true));
    assert.ok(n.VariableDeclaration.check(decl, true));

    // Not an Expression.
    assert.ok(!n.Expression.check(decl));

    // This makes decl cease to conform to n.VariableDeclaration.
    decl.declarations.push(b.identifier("bar"));

    assert.ok(n.Node.check(decl));
    assert.ok(n.Statement.check(decl));
    assert.ok(n.Declaration.check(decl));
    assert.ok(n.VariableDeclaration.check(decl));

    assert.ok(!n.Node.check(decl, true));
    assert.ok(!n.Statement.check(decl, true));
    assert.ok(!n.Declaration.check(decl, true));

    // As foretold above.
    assert.ok(!n.VariableDeclaration.check(decl, true));

    // Still not an Expression.
    assert.ok(!n.Expression.check(decl));

    var fs = b.forStatement(
        decl,
        b.binaryExpression("<", index, b.literal(48)),
        b.updateExpression("++", index, true),
        b.blockStatement([
            b.expressionStatement(
                b.callExpression(index, []))
        ]));

    assert.ok(n.Node.check(fs));
    assert.ok(n.Statement.check(fs));
    assert.ok(n.ForStatement.check(fs));

    // Not a true ForStatement because fs.init is not a true
    // VariableDeclaration.
    assert.ok(!n.Node.check(fs, true));
    assert.ok(!n.Statement.check(fs, true));
    assert.ok(!n.ForStatement.check(fs, true));

    t.finish();
};