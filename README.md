# node-getoptie

## Installation

```
npm install getoptie
```

## Usage

```javascript
var getoptie = require('getoptie');

var argv = getoptie('ab:m:*[v*]');

console.log(argv);
```
Run it
```
# node test.js -a -barg -vvv -m hello -mworld list of arguments
```
```javascript
{ options:
   { a: true,
     b: 'arg',
     v: [ true, true, true ],
     m: [ 'hello', 'world' ]
  },
  args: [ 'list', 'of', 'arguments' ] }
```

## Что это?

Небольшая библиотечка, которая берёт на себя чёрную работу по валидации параметров запуска консольных утилит.
В целом, базовый синтаксис похож на POSIX getopt(3), но он расширен и изменено поведение по умолчанию.

Что умеет обрабатывать и проверять:
 - обязательные аргументы (все аргументы по умолчанию обязательные)
 - необязательные аргументы (чтобы сделать аргумент необязательным, его нужно взять в квадратные скобки `[]`)
 - аргументы, заданные несколько раз (включается только усли указать суффикс `*` в описании)
 - конфликтующие аргументу (см. слудующий пункт)
 - комбинации аргументов, например: `"bc|d"` позволяет задавать либо `-b` и `-c`. либо только `-d`.
 Любые другие комбинации вызовут ошибку.
 Можно задвать более сложные варианты, например:
    - `ab(cd|ef:)`
    - `a|(b|(c|(d|f))`
 - аргументы, требующие параметра. Указываются суффиксом `:`, например: `"ab:c"` - тут `-b` требует параметр,
 остальные опции без параметра

## Example

Напишем небольшой тестовый скрипт, чтобы было проще проверять работу getoptie.
Скрипт принимает первым параметром описание опций (optstring), а следующие аргументы уже трактуются как
аргументы, которые нужно проверять.

```javascript
var getoptie = require('getoptie');

try {
	var options = getoptie(
		process.argv[2],
		process.argv.slice(3)
	);

	console.log(options);
} catch(e) {
	console.error(e.message);
	process.exit(255);
}
```

Проверяем

Несколько одинаковых опций и список параметров
```
% node test.js 'hv*a:*' -ahello -a world -vvv -h list of args
{ options: { a: [ 'hello', 'world' ], v: [ true, true, true ], h: true },
args: [ 'list', 'of', 'args' ] }
```

Проверка обязательных опций
```
% node test.js 'abc|ad' -a
Mandatory option(s) is not specified: -b, -c or -d
```

Тоже проверка обязательных опций, но больше вариантов
```
% node test.js 'a(b|c)|ad' -a
Mandatory option(s) is not specified: -b or -c or -d
```

Конфликтующие опции
```
% node test.js 'abc|ad' -adc
Option -c is not allowed here
```

Всё хорошо
```
% node test.js 'a[bc]|ad' -ab
{ options: { a: true, b: true }, args: [] } 
```
