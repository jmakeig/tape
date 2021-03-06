var tape = require('../');
var tap = require('tap');
var concat = require('concat-stream');
var tapParser = require('tap-parser');
var yaml = require('js-yaml');

tap.test('deep equal failure', function (assert) {
    var test = tape.createHarness({ exit : false });
    var stream = test.createStream();
    var parser = tapParser();
    assert.plan(3);

    stream.pipe(parser);
    stream.pipe(concat(function (body) {
        assert.equal(
            body.toString('utf8'),
            'TAP version 13\n'
            + '# deep equal\n'
            + 'not ok 1 should be equal\n'
            + '  ---\n'
            + '    operator: equal\n'
            + '    expected: |-\n'
            + '      { b: 2 }\n'
            + '    actual: |-\n'
            + '      { a: 1 }\n'
            + '  ...\n'
            + '\n'
            + '1..1\n'
            + '# tests 1\n'
            + '# pass  0\n'
            + '# fail  1\n'
        );

        assert.deepEqual(getDiag(body), {
          operator: 'equal',
          expected: '{ b: 2 }',
          actual: '{ a: 1 }'
        });
    }));

    parser.once('assert', function (data) {
        assert.deepEqual(data, {
            ok: false,
            id: 1,
            name: 'should be equal',
            diag: {
              operator: 'equal',
              expected: '{ b: 2 }',
              actual: '{ a: 1 }'
            }
        });
    });

    test("deep equal", function (t) {
        t.plan(1);
        t.equal({a: 1}, {b: 2});
    });
})

function getDiag (body) {
    var yamlStart = body.indexOf('  ---');
    var yamlEnd = body.indexOf('  ...\n');
    var diag = body.slice(yamlStart, yamlEnd).split('\n').map(function (line) {
        return line.slice(2);
   }).join('\n');

   return yaml.safeLoad(diag);
}
