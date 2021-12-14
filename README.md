# bullsandcows
&lt;&lt;work-in-progress>>  
Personal challenge to program a universal Mastermind/Bulls and Cows game solver with variable length secret (starting with {9,3}).

### Sources used for tactics and examples:  
[A Mathematical Approach to Simple Bulls and Cows](https://vixra.org/pdf/1601.0302v1.pdf) (2015) - Namanyay Goel, Aditya Garg  
[Optimal algorithms for mastermind and bulls-cows games](http://slovesnov.users.sourceforge.net/bullscows/bullscows.pdf) (2017) - Alexey Slovesnov  
[Strategies for playing MOO or Bulls and Cows](https://web.archive.org/web/20120425120039/http://www.jfwaf.com/Bulls%20and%20Cows.pdf) (2010) - John Francis  
[The computer as Master Mind](https://web.archive.org/web/20201108142331/https://www.cs.uni.edu/~wallingf/teaching/cs3530/resources/knuth-mastermind.pdf) (1976) - Donald E. Knuth  

### Third party content (license)
The code includes parts of Combinatorics.js:
```
/**
 * combinatorics.js
 *
 *  Licensed under the MIT license.
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  @author: Dan Kogai <dankogai+github@gmail.com>
 *  @modified_by: thomazz-nl
 *  @modifications: extracted a subset of required features
 *
 */
```

### Approach/progress
The two approaches by Namanyay Goel and Aditya Garg worked, I implemented their ideas (so it solved games). However, their code approach of determining the best next guess was flawed: it allowed to spawn endless loops. I was able to fix it, but it was still a lesser than optimal solution, so I abandoned their approach in search of a better algorithm.

Landing on the [website](http://slovesnov.users.sourceforge.net/?bullscows) of Alexey Slovesnov I found new inspiration, but reverse engineering his code learned me that Slovesnov uses pre-populated decision trees for the static problems of 4 characters. I want a universal/dynamic solution that calculates the decision trees live, but his work is still worth investigating.

### To do:
* Create a GUI to simulate games.
* Calculate our own decision trees.
* Separate appropriatly in multiple files.
