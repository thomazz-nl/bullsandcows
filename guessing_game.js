"use strict";

//const COMBINATORICS = (() => {
var COMBINATORICS = (() => {
    /**
     * combinatorics.js
     *
     *  Licensed under the MIT license.
     *  http://www.opensource.org/licenses/mit-license.php
     *
     *  @author: Dan Kogai <dankogai+github@gmail.com>
     *  @modified_by: Thomas Poot
     *  @modifications: extracted a subset of required features
     *
     */
    const _BI = typeof BigInt == 'function' ? BigInt : Number;

    /**
     * crops BigInt
     */
    const _crop = (n) => n <= Number.MAX_SAFE_INTEGER ? Number(n) : _BI(n);

    /**
     * Base Class of `js-combinatorics`
     */
    class _CBase {
        /**
         * does `new`
         * @param args
         */
        static of(...args) {
            return new (Function.prototype.bind.apply(this, [null].concat(args)));
        }
        /**
         * Common iterator
         */
        [Symbol.iterator]() {
            return function* (it, len) {
                for (let i = 0; i < len; i++)
                    yield it.nth(i);
            }(this, this.length);
        }
        /**
         * returns `[...this]`.
         */
        toArray() {
            return [...this];
        }
        /**
        * check n for nth
        */
        _check(n) {
            if (n < 0) {
                if (this.length < -n)
                    return undefined;
                return _crop(_BI(this.length) + _BI(n));
            }
            if (this.length <= n)
                return undefined;
            return n;
        }
        /**
         * get the `n`th element of the iterator.
         * negative `n` goes backwards
         */
        nth(n) { return []; };
    }

    /**
     * Base N
     */
    class BaseN extends _CBase {
        constructor(seed, size = 1) {
            super();
            this.seed = [...seed];
            this.size = size;
            let base = this.seed.length;
            this.base = base;
            let length = size < 1 ? 0
                : Array(size).fill(_BI(base)).reduce((a, v) => a * v);
            this.length = _crop(length);
            Object.freeze(this);
        }
        nth(n) {
            n = this._check(n);
            if (n === undefined)
                return undefined;
            let bn = _BI(n);
            const bb = _BI(this.base);
            let result = [];
            for (let i = 0; i < this.size; i++) {
                var bd = bn % bb;
                result.push(this.seed[Number(bd)]);
                bn -= bd;
                bn /= bb;
            }
            return result;
        }
    }

    /**
     * Permutation
     */
    class Permutation extends _CBase {
        constructor(seed, size = 0) {
            super();
            this.seed = [...seed];
            this.size = 0 < size ? size : this.seed.length;
            this.length = permutation(this.seed.length, this.size);
            Object.freeze(this);
        }
        nth(n) {
            n = this._check(n);
            if (n === undefined)
                return undefined;
            const offset = this.seed.length - this.size;
            const skip = factorial(offset);
            let digits = factoradic(_BI(n) * _BI(skip), this.seed.length);
            let source = this.seed.slice();
            let result = [];
            for (let i = this.seed.length - 1; offset <= i; i--) {
                result.push(source.splice(digits[i], 1)[0]);
            }
            return result;
        }
    }

    /**
     * returns the factoradic representation of `n`, least significant order.
     *
     * @link https://en.wikipedia.org/wiki/Factorial_number_system
     * @param {number} l the number of digits
     */
    function factoradic(n, l = 0) {
        if (n < 0)
            return undefined;
        let [bn, bf] = [_BI(n), _BI(1)];
        if (!l) {
            for (l = 1; bf < bn; bf *= _BI(++l))
                ;
            if (bn < bf)
                bf /= _BI(l--);
        }
        else {
            bf = _BI(factorial(l));
        }
        let digits = [0];
        for (; l; bf /= _BI(l--)) {
            digits[l] = Math.floor(Number(bn / bf));
            bn %= bf;
        }
        return digits;
    }

    /**
     * calculates `n!` === `P(n, n)`.
     *
     * @link https://en.wikipedia.org/wiki/Factorial
     */
    function factorial(n) {
        return permutation(n, n);
    }

    /**
     * calculates `P(n, k)`.
     *
     * @link https://en.wikipedia.org/wiki/Permutation
     */
    function permutation(n, k) {
        if (n < 0)
            throw new RangeError(`negative n is not acceptable`);
        if (k < 0)
            throw new RangeError(`negative k is not acceptable`);
        if (0 == k)
            return 1;
        if (n < k)
            return 0;
        [n, k] = [_BI(n), _BI(k)];
        let p = _BI(1);
        while (k--)
            p *= n--;
        return _crop(p);
    }

    let exports         = {};
    exports.factorial   = factorial;
    exports.permutation = permutation;
    exports.BaseN       = BaseN;
    exports.Permutation = Permutation;

    return exports;
})();

// Would love to use JS classes, but prefer this style while private fields (indicited by #) are not supported in Firefox yet.
var GameSimulator = function(
    gameOptions = {
        allowRepetition: true,
        elementsN: new Array('black', 'blue', 'green', 'red', 'white', 'yellow'),
        choosePartialK: 4,
        maxTurns: 12
    }) {

    const LOG_LEVEL = {
        NONE:           0,
        INFO:           1,
        VERBOSE:        2
    }

    // Private fields
    let code = generateCode();
    let self = this;
    let turn = 0;

    // Private methods
    function debug(msg, logLevel=0) {
        //(!!(logLevel & LOG_LEVEL.INFO) || !!(logLevel & LOG_LEVEL.VERBOSE)) && console.log(msg);
        //!!(logLevel & LOG_LEVEL.INFO) && console.log(msg);
        !!(logLevel & LOG_LEVEL.NONE) && console.log(msg);
    }

    function generateCode() {
        let secretCode          = new Array(gameOptions.choosePartialK);
        let availableOptions    = gameOptions.elementsN.slice();

        if (gameOptions.allowRepetition) {
            for (let i = 0; i < gameOptions.choosePartialK; i++) {
                // Pick a random option and appoint it to secretCode.
                secretCode[i] = availableOptions[Math.floor(Math.random() * availableOptions.length)];
            }
        } else {
            for (let i = 0; i < gameOptions.choosePartialK; i++) {
                // Pick a random option and appoint it to secretCode. Remove the alteration from the availableOptions list.
                secretCode[i] = availableOptions.splice(Math.floor(Math.random() * availableOptions.length), 1)[0];
            }
        }

        debug('GameSimulator: secret code is generated: ' + secretCode, LOG_LEVEL.VERBOSE);

        return secretCode;
    }

    // Public methods
    self.guess = function(variation) {
        let reply = null;

        if(!Array.isArray(variation)) {
           throw new TypeError('variation is not of type Array.');
        } else if (!variation.length || variation.length > gameOptions.choosePartialK) {
            console.warn('GameSimulator: variation is empty or longer than the set we\'re guessing (choosePartialK).');
        } else if (Object.values(variation).length != variation.length) {
            console.warn('GameSimulator: variation array has gaps.');
        } else if (variation.some((entry) => { return typeof(entry) == 'undefined' || entry == null || (Number.isInteger(entry) && entry < 0); })) {
            console.warn('GameSimulator: variation array has invalid values (undefined, null or negative number).');
        } else if (++turn > gameOptions.maxTurns) {
            console.warn('GameSimulator: passed maximum amount of turns, no more guesses allowed.');
        } else {
            let variationCopy = variation.slice();
            reply = {
                exactMatches:   0,
                partialMatches: 0,
                toString: function(){ return `${this.exactMatches} exact, ${this.partialMatches} partial`}
            };

            // Try to find exact matches by looping the guessed variation (it's length can be shorter than the actual code).
            for(let i = 0; i < variationCopy.length; i++) {
                if (variationCopy[i] === code[i]) {
                    debug(`GameSimulator: exact match found for position ${i} (guess: ${variationCopy[i]}).`, LOG_LEVEL.VERBOSE);
                    reply.exactMatches++;
                    variationCopy[i] = -2;	// Mark as -2 to prevent further matching.
                } else {
                    debug(`GameSimulator: no exact match found for position ${i} (guess: ${variationCopy[i]}).`, LOG_LEVEL.VERBOSE);
                }
            }

            // Try to find partial matches by looping the guessed variation and lookup their presence in code.
            for(let i = 0; i < variationCopy.length; i++) {
                if (variationCopy[i] == -2) {
                    debug(`GameSimulator: variation position ${i} skipped, it has been matched before.`, LOG_LEVEL.VERBOSE);
                } else {
                    let matchingCodeIndex = code.indexOf(variationCopy[i]);

                    if(matchingCodeIndex !== -1) {	// It is present in variation.
                        debug(`GameSimulator: variation position ${i} (guess: ${variationCopy[i]}) matches code position ${matchingCodeIndex}.`, LOG_LEVEL.VERBOSE);
                        reply.partialMatches++;
                        variationCopy[i] = -2;	// Mark as -2 to prevent further matching.
                    } else {
                        debug(`GameSimulator: variation position ${i} (guess: ${variationCopy[i]}) has no matches.`, LOG_LEVEL.VERBOSE);
                    }
                }
            }
        }

        debug(`GameSimulator: answering ${reply ? reply.toString() : reply}`, LOG_LEVEL.INFO);

        return reply;
    };

    self.setCode = function(overrideCode) {
        if(!Array.isArray(overrideCode)) {
           throw new TypeError('overrideCode is not of type Array.');
        } else {
            code = overrideCode.map(value => typeof value == "number" ? value.toString() : value);
            debug('GameSimulator: secret code is manually set to: ' + code, LOG_LEVEL.VERBOSE);
        }
    };

    self.reset = function() {
        code = generateCode();
        turn = 0;
    }

    // Constructor
    return self;
};

var GameSolver = function(
    gameOptions = {
        allowRepetition: true,
        elementsN: new Array('black', 'blue', 'green', 'red', 'white', 'yellow'),
        choosePartialK: 4,
        maxTurns: 12
    },
    gameSimulator) {

    // Calculate total number of possible (partial/k-) permutations. **Replaced by combinatorics.js version**
    /*function calculatePermutationCount(elementsN, choosePartialK=elementsN)
    {
        if (elementsN < 0) {
            throw new RangeError(`negative n is not acceptable`);
        }
        if (choosePartialK < 0) {
            throw new RangeError(`negative k is not acceptable`);
        }
        if (elementsN < choosePartialK) {
            return 0;
        } else {
            let value = 1;
            let index = elementsN-choosePartialK;   // Calculate the full factorial by default, or the falling factorial when a custom choosePartialK is provided.

            while (index++ < elementsN) {           // Reminder: the postfix increment operator returns the value it had before the increment was applied (opposite of the prefix e.g. ++i variant).
                value *= index;
            }

            return value;
        }
    }*/

    const LOG_LEVEL = {
        NONE:                   0,
        INFO:                   1,
        VERBOSE:                2,
        SEARCH_UNIQUE_GUESS:    4,
        SEARCH_UNIQUE_SET:      8,
        PRUNING:                16
    }

    let self                    = this;
    //self.allVariationCount      = gameOptions.allowRepetition ? Math.pow(gameOptions.choosePartialK, gameOptions.elementsN.length) : COMBINATORICS.permutation(gameOptions.elementsN.length, gameOptions.choosePartialK);
    self.allVariations          = gameOptions.allowRepetition ? new COMBINATORICS.BaseN('1234567890', gameOptions.choosePartialK).toArray() : new COMBINATORICS.Permutation('123456789', gameOptions.choosePartialK).toArray();

    let gameStats               = {
        "attemptedGuesses": new Array(),
        "repeatedGuesses":  new Array(),
        "solution":         undefined,
    };
    let remainingVariations     = self.allVariations.slice();   // Create an actual copy instead of referencing to allVariations.
    let remainingVariationUEPC  = getUniqueElementPositionCount(remainingVariations);
    let responseClassesTotal    = (gameOptions.choosePartialK + 1)*(gameOptions.choosePartialK + 2)/2 - 1;

    function debug(msg, logLevel=0) {
        //(!!(logLevel & LOG_LEVEL.INFO) || !!(logLevel & LOG_LEVEL.VERBOSE)) && console.log(msg);
        //(logLevel & LOG_LEVEL.INFO) && console.log(msg);
        (logLevel & LOG_LEVEL.NONE) && console.log(msg);
    }

    function getElementOccurrenceCount(uniqueElementPositionCount) {
        return uniqueElementPositionCount.reduce((accumulator, currentValue) => {
            let key = currentValue['value'];

            if (!accumulator[key]) {
                accumulator[key] = currentValue.count;
            } else {
                accumulator[key] += currentValue.count;
            }

            return accumulator;
        }, new Object());
    }

    function getSortedUEPC(uniqueElementPositionCount, sortBy = 'count', groupBy) {
        let selectedSortMethod;
        let uepcCopy       = uniqueElementPositionCount.slice();
        let sortByCount     = (obj1, obj2) => {
            if (obj1.count == obj2.count) {
                if (obj1.position == obj2.position) {
                    if (obj1.value == obj2.value) {
                        return 0;
                    } else {
                        return obj1.value < obj2.value ? -1 : 1;
                    }
                } else {
                    return obj1.position - obj2.position;
                }
            } else {
                return obj1.count - obj2.count;
            }
        };
        let sortByPosition  = (obj1, obj2) => {
            if (obj1.position == obj2.position) {
                if (obj1.value == obj2.value) {
                    if (obj1.count == obj2.count) {
                        return 0;
                    } else {
                        return obj1.count - obj2.count;
                    }
                } else {
                    return obj1.value < obj2.value ? -1 : 1;
                }
            } else {
                return obj1.position - obj2.position;
            }
        };
        let sortByValue     = (obj1, obj2) => {
            if (obj1.value == obj2.value) {
                if (obj1.position == obj2.position) {
                    if (obj1.count == obj2.count) {
                        return 0;
                    } else {
                        return obj1.count - obj2.count;
                    }
                } else {
                    return obj1.position - obj2.position;
                }
            } else {
                return obj1.value < obj2.value ? -1 : 1;
            }
        };

        switch(sortBy) {
            case 'count':
                selectedSortMethod = sortByCount;
                break;
            case 'position':
                selectedSortMethod = sortByPosition;
                break;
            case 'value':
                selectedSortMethod = sortByValue;
                break;
            default:
                selectedSortMethod = sortByCount;
        }

        uepcCopy.sort(selectedSortMethod);

        if (groupBy) {
            let selectedGroupMethod;

            switch(groupBy) {
                case 'count':
                    selectedGroupMethod = 'count';
                break;
                case 'position':
                    selectedGroupMethod = 'position';
                    break;
                case 'value':
                    selectedGroupMethod = 'value';
                    break;
                default:
                    selectedGroupMethod = 'count';
            }

            uepcCopy = uepcCopy.reduce((accumulator, currentValue) => {
                let key = currentValue[selectedGroupMethod];

                if (!accumulator[key]) {
                    accumulator[key] = new Array();
                }

                accumulator[key].push(currentValue);

                return accumulator;
            }, new Array());
        }

        return uepcCopy;
    }

    function getTestReply(guess, testVariation) {
        let guessCopy   = guess.slice();
        let reply       = {
            exactMatches:   0,
            partialMatches: 0,
            toString: function(){ return `${this.exactMatches}B${this.partialMatches}C`}
        };

        // Try to find exact matches between guess and a testVariation. See GameSimulator.guess for more details on logic.
        for(let j = 0; j < guessCopy.length; j++) {
            if (guessCopy[j] === testVariation[j]) {
                reply.exactMatches++;
                guessCopy[j] = -2;
            }
        }

        // Try to find partial matches between guess and a testVariation. See GameSimulator.guess for more details on logic.
        for(let j = 0; j < guessCopy.length; j++) {
            if (guessCopy[j] != -2) {
                let matchingCodeIndex = testVariation.indexOf(guessCopy[j]);

                if(matchingCodeIndex !== -1) {
                    reply.partialMatches++;
                    guessCopy[j] = -2;
                }
            }
        }

        return reply;
    }

    function getUniqueElementPositionCount(variations) {
        let variationStats = new Array();

        // Count the number of occcurrences of each option (elementsN) per position.
        variations.forEach(variation => {
            for(let i=0; i < variation.length; i++) {
                let positionValueStatIndex = variationStats.findIndex(obj => obj.position == i && obj.value == variation[i]);

                if(positionValueStatIndex >= 0) {
                    variationStats[positionValueStatIndex].count++;
                } else {
                    variationStats.push({
                        count: 1,
                        position: i,
                        value: variation[i]
                    });
                }
            }
        });

        return variationStats;
    }

    function getUniqueGuesses(remainingVariations, allVariations) {
        // Testcase: remainingVariations = [["2","4","3"],["3","4","2"],["4","3","2"],["4","2","5"],["1","4","2"],["1","5","3"]];
        let uniqueGuesses = new Array();

        // Try to find a unique guess with each possible variation that can eliminate all but one variation.
        for (let i=0; i < allVariations.length; i++) {
            let testReplies = new Array();

            // Get replies for matching a possible variation against each remainingVariation.
            remainingVariations.forEach(remainingVariation => {
                let testReply = getTestReply(remainingVariation, allVariations[i]);
                testReplies.push(testReply.toString());
            });

            if (isUniqueSetOfElements(testReplies)) {
                debug(`GameSolver: unique guess found for ${allVariations[i]} against ${remainingVariations.join(', ')} --- ${testReplies.join(', ')}`, LOG_LEVEL.SEARCH_UNIQUE_GUESS);
                uniqueGuesses.push(allVariations[i]);
            }
        }

        return uniqueGuesses;
    }

    function isUniqueSetOfElements(setOfElements) {
        // Testcase: setOfElements = true ? ['3:0','1:2','0:3','0:2','1:1','1:0'] : ['2:0','1:1','0:2','0:2','1:2','0:1'];
        return setOfElements.every((testReply1, index, array) => {
            let duplicateCount = 0;

            // Matching every set against itself while keeping count of encountered duplicates.
            let isUnique = array.every(testReply2 => {
                if (testReply1 == testReply2) {
                    duplicateCount++;
                }

                debug(`GameSolver: matching ${testReply1} vs ${testReply2} - duplicateCount=${duplicateCount} - uniqueStatus=${duplicateCount <= 1}`, LOG_LEVEL.SEARCH_UNIQUE_SET);

                return duplicateCount <= 1; // Return true (continue .every) while duplicateCount is 0 or 1 (match against itself). Return false (abort .every) when duplicateCount is 2 or more: the set does not exist of unique elements.
            });

            debug(`GameSolver: uniqueStatus=${isUnique}`, LOG_LEVEL.SEARCH_UNIQUE_SET);
            return isUnique;   // Continue .every until we found duplicate elements.
        });
    }

    self.getGameAnalysis = function(gameResults) {
        let gameLengths             = gameResults.map(gameResult => gameResult.attemptedGuesses.length).sort((a, b) => a - b);
        let repeatedGuessGameCount  = gameResults.reduce((accumulator, gameResult) => accumulator + (gameResult.repeatedGuesses.length > 0 ? 1 : 0), 0);
        return new Object({
            avgGuesses: gameLengths.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / gameLengths.length,
            maxGuesses: Math.max(...gameLengths),
            median: (gameLengths[Math.floor((gameLengths.length - 1) / 2)] + gameLengths[Math.ceil((gameLengths.length - 1) / 2)]) / 2,
            minGuesses: Math.min(...gameLengths),
            repeatGuessGameCount: repeatedGuessGameCount,
            repeatGuessAvgAttempts: repeatedGuessGameCount == 0 ? 0 : gameResults.reduce((accumulator, gameResult) => accumulator + gameResult.repeatedGuesses.length, 0) / repeatedGuessGameCount,
            unresolved: gameResults.reduce((accumulator, gameResult) => accumulator + (typeof gameResult.solution === 'undefined' ? 1 : 0), 0)
        });
    };

    self.getNextGuess = function(offsetOnRepeatedGuess = 0) {
        let nextGuess = new Array();

        if (remainingVariations.length <= 2) {
            nextGuess = remainingVariations[0];   // For 1 variation: it's the solution. For 2: 50% win-chance on 1st try and 100% on 2nd try is better than finding a optimal discriminator (always costs 2 turns).
        } else {
            if (remainingVariations.length < 100) {    // Compute expensive operation to find uniques, so only do it when we already pruned the list a bit.
                debug('GameSolver: trying to find unique guesses...', LOG_LEVEL.VERBOSE);
                let uniqueGuesses = getUniqueGuesses(remainingVariations, self.allVariations);

                if (uniqueGuesses && uniqueGuesses.length) {
                    let joinedUniqueGuesses = uniqueGuesses.map(uniqueGuess => uniqueGuess.join(''));
                    debug('GameSolver: unique guesses found:', LOG_LEVEL.VERBOSE);
                    debug(joinedUniqueGuesses, LOG_LEVEL.VERBOSE);

                    // If one of the remainingVariations is a uniqueGuess, try that as next guess (as a bonus you also have a direct chance on win)
                    nextGuess = remainingVariations.find((remainingVariation) => joinedUniqueGuesses.includes(remainingVariation.join(''))) || uniqueGuesses[0];
                }
            }

            if (!nextGuess.length) {
                // Values sorted by the lowest occurrence count are good guess candidates as they reduce the most remainingVariations from the set.
                let countSortedStats = getSortedUEPC(remainingVariationUEPC, 'count');   // Sort the statistics prioritized by count > position > value. Minimizes the risk of creating a repeated guess, but I'm not sure it can be ruled out yet.

                /*
                *   Improve by only selecting lowest count per-position??!!
                    8 7 7
                    9 9 8

                    877
                    977
                    897<
                    997
                    878
                    978<
                    898
                    998
                */

                for (let i=offsetOnRepeatedGuess; nextGuess.length != gameOptions.choosePartialK && i < countSortedStats.length; i++) {
                    if (nextGuess.indexOf(countSortedStats[i].value) == -1) {  // Prevent double occurrences of elementsN in nextGuess.
                        nextGuess.push(countSortedStats[i].value);
                    }
                }
            }
        }

        return nextGuess;
    };

    self.pruneRemainingVariations = function(variationGuess, reply) {
        let prunedVariations = new Array();

        debug('GameSolver: eliminated impossible variations:', LOG_LEVEL.VERBOSE);

        // Do reverse for-loop as array size will change during loop (incrementing would cause items to be skipped).
        for(let i=remainingVariations.length-1; i >= 0; i--) {
            let testReply = getTestReply(variationGuess, remainingVariations[i]);

            // If the reply comparing the variationGuess to the secret code is different from the reply comparing variationGuess to a remainingVariation, that remainingVariation cannot be the solution.
            if (testReply.exactMatches != reply.exactMatches || testReply.partialMatches != reply.partialMatches) {
                debug(`GameSolver: variation ${remainingVariations[i].join('')} differs from outcome of guess ${variationGuess.join('')} (${testReply.exactMatches}:${testReply.partialMatches}/${reply.exactMatches}:${reply.partialMatches}).`, LOG_LEVEL.PRUNING);
                prunedVariations.push(remainingVariations.splice(i, 1));
            }
        }

        debug(prunedVariations.reverse(), LOG_LEVEL.VERBOSE);

        remainingVariationUEPC = getUniqueElementPositionCount(remainingVariations);

        debug('GameSolver: Remaining variations:', LOG_LEVEL.VERBOSE);
        debug(remainingVariations.slice(), LOG_LEVEL.VERBOSE);

        debug('GameSolver: Remaining variation statistics:', LOG_LEVEL.VERBOSE);
        debug(getSortedUEPC(remainingVariationUEPC, 'count'), LOG_LEVEL.VERBOSE);
        debug(getElementOccurrenceCount(remainingVariationUEPC), LOG_LEVEL.VERBOSE);
    };

    self.reset = function() {
        gameStats               = {
            "attemptedGuesses": new Array(),
            "repeatedGuesses":  new Array(),
            "solution":         undefined,
        };
        remainingVariations     = self.allVariations.slice();   // Create an actual copy instead of referencing to allVariations.
        remainingVariationUEPC  = getUniqueElementPositionCount(remainingVariations);
    };

    self.solve = function() {
        if (gameOptions.allowRepetition) {
            // to do (implement a Knuth-like algorithm?)
        } else {
            let reply;

            do {
                let variationGuess          = self.getNextGuess();
                let variationGuessString    = variationGuess.join('');

                // Try to provide a new guess if getNextGuess provided us a repeated variationGuess. Keep increasing the offset to obtain a next guess, until we get an empty array (out of options).
                for (let offsetOnRepeatedGuess=1; gameStats.attemptedGuesses.indexOf(variationGuessString) != -1 && variationGuess.length != 0; offsetOnRepeatedGuess++) {
                    debug(`GameSolver: Got repeated guess! Using offsetOnRepeatedGuess=${offsetOnRepeatedGuess}`, LOG_LEVEL.INFO | LOG_LEVEL.VERBOSE);
                    gameStats.repeatedGuesses.push({
                        "guess":                variationGuessString,
                        "getNextGuessOffset":   offsetOnRepeatedGuess
                    });
                    variationGuess          = self.getNextGuess(offsetOnRepeatedGuess);
                    variationGuessString    = variationGuess.join('');
                }

                if (variationGuess.length) {
                    debug(`GameSolver: turn ${gameStats.attemptedGuesses.length+1} guessing ${variationGuess}`, LOG_LEVEL.INFO | LOG_LEVEL.VERBOSE);
                    reply = gameSimulator.guess(variationGuess);

                    if (reply) {
                        gameStats.attemptedGuesses.push(variationGuessString);
                        self.pruneRemainingVariations(variationGuess, reply);
                    }
                } else {
                    throw new Error('Pool of guesses drained using getNextGuess. Caught in a loop?');
                }
            } while (reply && reply.exactMatches != gameOptions.choosePartialK);

            if (reply && reply.exactMatches == gameOptions.choosePartialK) {
                gameStats.solution = gameStats.attemptedGuesses[gameStats.attemptedGuesses.length-1];
                debug(`GameSolver: combination found in ${gameStats.attemptedGuesses.length} ${gameStats.attemptedGuesses.length != 1 ? 'guesses' : 'guess'}: ${gameStats.solution}.`, LOG_LEVEL.INFO | LOG_LEVEL.VERBOSE);
            } else {
                console.warn(`GameSolver: aborted unsolved game after ${gameStats.attemptedGuesses.length} ${gameStats.attemptedGuesses.length != 1 ? 'guesses' : 'guess'}.`);
            }

            return gameStats;
        }
    };

    self.buildNode = function(tree, node = { children: new Map(), guess: Array.from('123'), set: self.allVariations }) {
        let index = tree.push(node)-1;

        node.guess = node.set.length <= 2 ? node.set[0] : node.guess;   // For 1 variation: it's the solution. For 2: 50% win-chance on 1st try and 100% on 2nd try is better than finding a optimal discriminator (always costs 2 turns).

        if (node.guess && node.set.length > 1) {                        // For now, only continue building the tree when you have a guess. No need to continue complete children and tree when set has just one variation.
            let groupedResponses    = new Object();
            let responseClasses     = new Array();

            node.set.forEach(variation => {
                let reply       = getTestReply(variation, node.guess);

                if (reply.exactMatches != gameOptions.choosePartialK) { // No need to add the solution as childNode to the tree.
                    if (groupedResponses[reply.toString()]) {
                        groupedResponses[reply.toString()].push(variation);
                    } else {
                        groupedResponses[reply.toString()] = new Array(variation);
                    }
                }
            });

            responseClasses = Object.keys(groupedResponses).sort();

            responseClasses.forEach(responseClass => {
                let childNode = {
                    children: new Map(),
                    guess: false,
                    set: groupedResponses[responseClass]
                };

                if (groupedResponses[responseClass].length <= responseClassesTotal) {
                    let uniqueGuesses   = getUniqueGuesses(groupedResponses[responseClass], self.allVariations);
                    childNode.guess     = uniqueGuesses.length > 0 ? uniqueGuesses[0] : false;
                }

                node.children.set(responseClass, self.buildNode(tree, childNode));
            });
        }

        return index;
    };

    self.buildTree = function() {
        let decisionTree = new Array();
        self.buildNode(decisionTree);
        return decisionTree;
    };

    return self;
};

var myGameOptions   = {
    allowRepetition:    false,
    elementsN:          Array.from('123456789'),
    choosePartialK:     3,
    maxTurns:           12
};

//var gameResults     = new Array();
var myGameSimulator = new GameSimulator(myGameOptions);
var myGameSolver    = new GameSolver(myGameOptions, myGameSimulator);
myGameSolver.buildTree();
/*for (let i=0; i < myGameSolver.allVariations.length; i++) {
    //myGameSimulator.setCode(Array.from('279'));
    //myGameSimulator.setCode(Array.from('679'));       // Unique set condition
    //myGameSimulator.setCode(Array.from('654'));       // Loop condition
    myGameSimulator.setCode(myGameSolver.allVariations[i]);
    gameResults.push(myGameSolver.solve());
    myGameSimulator.reset();
    myGameSolver.reset();
}

console.log(gameResults);
console.log(myGameSolver.getGameAnalysis(gameResults));*/

//myGameSolver.getNextGuess();
//myGameSolver.pruneRemainingVariations(Array.from('123'),{exactMatches: 0, partialMatches: 0});