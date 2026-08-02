"use client";

import { useCallback, useMemo, useState } from "react";

type Difficulty = "relaxed" | "clever" | "fierce";
type Owner = 0 | 1 | 2;

const BASE_LETTERS = "STARECLOUDPINGMBEACHFORYT".split("");
const WORDS = `
ace ache act actor adore aer alert aloe alone alter amber ample angel angle angry ant ante any ape arch are area arm art ate atom aunt auto
bad bag bar bare bat bath be beach beam bean bear beat bed bee been beer belt bent best bet bird bite boat bone bore born both bowl boy brain bread break bring broad broke brown build burn burst
cab cable cage can cane cap cape car care cargo cart case cash cast cat catch cave chair charm chart chat chef child choir chose cite city claim clap clear climb clip close cloud coat coil coin cold color comb come core corn cost could count court cover craft crash crate crawl cream crop cross crowd crown cure curl cute
daily dare dark dart date day deal dear debt deck deep deer do dog doll door dot doubt down drag draw dream drip drop drum dry dune dust
each ear earn earth east eat echo edge edit eight else ember empty end era even ever every
face fact fair fall fame far farm fast fate fear feast feed feel feet felt field file film fire firm first fish fit five flag flame flat float floor flow foam fold food foot force forest form fort four frame free fresh from frost fruit full
game gate gear gem get giant gift girl give glad glare glass glow goal goat gold good grain grape graph grass great green grin grip group grow guard guide
hair half hall hand hard harm hat hate have haze head hear heart heat heel held help herb here hero hide hill hint hit hold hole home hope horn horse hot hour house huge hunt hurt
ice idea image in inch into iron item
jar jazz jet job join joke joy jump just
keep key kid kind king kite knee knew know
lace lake land large last late laugh lead leaf learn least left leg lemon lend less let liar life lift light like line link lion list live load loaf loan lock log long look lose lost loud love low luck lunar lunch
made mail main make male mall man many map march mark mass match mate may meal mean meat meet melt men metal mild mile milk mind mine mint miss mist moon more most mother mouse mouth move much mud music must
nail name near neat nest net new nice night nine node north nose note now nurse
oar oat ocean odd off old olive once one open or orange other our out over own
pace pack page paint pair pale palm pan panel paper park part path pay peace peak pear pen pet pick pie pin pink pipe place plain plane plant plate play plot poem point pool poor port pose post pot pound power print pull pure push
queen quest quick quiet quit quiz
race rain raise rake ran range rare rate reach read real red reef rest rice rich ride right ring rise river road roam rock role roll roof room root rope rose rough round route row rule run
safe sail salt same sand save scale scan scar sea seal seat seed seem self send set shade shake shape share sharp she sheep shelf shell shine ship shirt shoe shop short show side sign silk sing sit six size sky sleep slice slide slow small smart smile smoke snow soft soil sold some song soon sort sound soup south space spare speak speed spell spend spice spin split spoon sport spot spring star start steam steel step stick still stone stood stop store storm story stove straw stream street strong sum sun sure swim
table tail take tale talk tall tape task tea teach team tear tell ten tent test than thank that the their them then there these they thin thing think this three tide tie tile time tiny to toast toe tone tool top total touch tour town trace track trail train trap tree trick trip true try tune turn two
under unit up use
vast very vine visit voice vote
wait wake walk wall want warm was wash watch water way wear week well west wet whale what wheel when where which white who wide wild wind wine wing winter wire wise wish with wolf wood word wore work world would write wrong
yard year yellow yes yet you young your
`.trim().split(/\s+/);

const DICTIONARY = new Set(WORDS);
const ORTHO = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

function shuffledLetters() {
  const a = [...BASE_LETTERS];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function neighbors(index: number) {
  const row = Math.floor(index / 5), col = index % 5;
  return ORTHO.map(([dr, dc]) => [row + dr, col + dc])
    .filter(([r, c]) => r >= 0 && r < 5 && c >= 0 && c < 5)
    .map(([r, c]) => r * 5 + c);
}

function protectedTiles(owners: Owner[]) {
  return owners.map((owner, i) => owner !== 0 && neighbors(i).every(n => owners[n] === owner));
}

function canForm(word: string, letters: string[]) {
  const available = [...letters];
  return [...word.toUpperCase()].every(letter => {
    const i = available.indexOf(letter);
    if (i < 0) return false;
    available.splice(i, 1);
    return true;
  });
}

function chooseTiles(word: string, letters: string[], owners: Owner[], difficulty: Difficulty) {
  const locked = protectedTiles(owners);
  const used = new Set<number>();
  return [...word.toUpperCase()].map(letter => {
    const candidates = letters.map((l, i) => l === letter && !used.has(i) ? i : -1).filter(i => i >= 0);
    candidates.sort((a, b) => {
      const value = (i: number) => {
        if (owners[i] === 1 && !locked[i]) return difficulty === "fierce" ? 9 : 5;
        if (owners[i] === 0) return 3;
        if (owners[i] === 2) return 1;
        return -4;
      };
      return value(b) - value(a) + (Math.random() - .5);
    });
    const pick = candidates[0];
    used.add(pick);
    return pick;
  });
}

const LABELS: Record<Difficulty, { name: string; note: string; face: string }> = {
  relaxed: { name: "Relaxed", note: "A gentle first match", face: "◡" },
  clever: { name: "Clever", note: "Plans a few moves ahead", face: "•ᴗ•" },
  fierce: { name: "Fierce", note: "Protects and steals", face: "◉‿◉" },
};

export default function Home() {
  const [screen, setScreen] = useState<"home" | "game" | "rules">("home");
  const [difficulty, setDifficulty] = useState<Difficulty>("clever");
  const [letters, setLetters] = useState(BASE_LETTERS);
  const [owners, setOwners] = useState<Owner[]>(Array(25).fill(0));
  const [selected, setSelected] = useState<number[]>([]);
  const [played, setPlayed] = useState<{ word: string; owner: 1 | 2 }[]>([]);
  const [turn, setTurn] = useState<"you" | "rival" | "done">("you");
  const [message, setMessage] = useState("Make any word");

  const locked = useMemo(() => protectedTiles(owners), [owners]);
  const currentWord = selected.map(i => letters[i]).join("").toLowerCase();
  const yourScore = owners.filter(o => o === 1).length;
  const rivalScore = owners.filter(o => o === 2).length;

  const newGame = (level = difficulty) => {
    setDifficulty(level);
    setLetters(shuffledLetters());
    setOwners(Array(25).fill(0));
    setSelected([]);
    setPlayed([]);
    setTurn("you");
    setMessage("Make any word");
    setScreen("game");
  };

  const applyClaim = useCallback((tileIds: number[], owner: 1 | 2, source: Owner[]) => {
    const protectedNow = protectedTiles(source);
    const next = [...source];
    tileIds.forEach(i => {
      if (!(source[i] !== 0 && source[i] !== owner && protectedNow[i])) next[i] = owner;
    });
    return next;
  }, []);

  const rivalMove = useCallback((sourceOwners: Owner[], sourcePlayed: { word: string; owner: 1 | 2 }[]) => {
    const usedWords = new Set(sourcePlayed.map(p => p.word));
    const candidates = WORDS.filter(w => w.length >= 3 && w.length <= 9 && !usedWords.has(w) && canForm(w, letters));
    const ranked = candidates.map(word => {
      const ids = chooseTiles(word, letters, sourceOwners, difficulty);
      const protectedNow = protectedTiles(sourceOwners);
      const captures = ids.filter(i => sourceOwners[i] === 1 && !protectedNow[i]).length;
      const open = ids.filter(i => sourceOwners[i] === 0).length;
      const score = word.length + captures * (difficulty === "fierce" ? 4 : 2) + open * .7 + Math.random() * 3;
      return { word, ids, score };
    }).sort((a, b) => b.score - a.score);
    const pool = difficulty === "relaxed" ? ranked.filter(x => x.word.length <= 5).slice(0, 18)
      : difficulty === "clever" ? ranked.slice(0, 8) : ranked.slice(0, 2);
    const move = pool[Math.floor(Math.random() * Math.max(pool.length, 1))] || ranked[0];
    if (!move) { setTurn("you"); setMessage("Your turn"); return; }
    const nextOwners = applyClaim(move.ids, 2, sourceOwners);
    const nextPlayed = [...sourcePlayed, { word: move.word, owner: 2 as const }];
    setOwners(nextOwners);
    setPlayed(nextPlayed);
    const filled = nextOwners.every(Boolean);
    setTurn(filled ? "done" : "you");
    setMessage(filled ? (nextOwners.filter(o=>o===1).length > nextOwners.filter(o=>o===2).length ? "You held the field!" : "The field is claimed") : `${LABELS[difficulty].name} played ${move.word.toUpperCase()}`);
  }, [applyClaim, difficulty, letters]);

  const submit = () => {
    if (turn !== "you") return;
    if (currentWord.length < 2) { setMessage("Choose at least 2 letters"); return; }
    if (!DICTIONARY.has(currentWord)) { setMessage("That word isn’t in this board’s dictionary"); return; }
    if (played.some(p => p.word === currentWord)) { setMessage("That word has already been played"); return; }
    const nextOwners = applyClaim(selected, 1, owners);
    const nextPlayed = [...played, { word: currentWord, owner: 1 as const }];
    setOwners(nextOwners);
    setPlayed(nextPlayed);
    setSelected([]);
    if (nextOwners.every(Boolean)) {
      setTurn("done");
      setMessage(nextOwners.filter(o=>o===1).length > nextOwners.filter(o=>o===2).length ? "You held the field!" : "The field is claimed");
      return;
    }
    setTurn("rival");
    setMessage(`${LABELS[difficulty].name} is thinking…`);
    window.setTimeout(() => rivalMove(nextOwners, nextPlayed), 650);
  };

  if (screen === "home") return (
    <main className="home-shell">
      <section className="brand-block">
        <div className="mini-field" aria-hidden="true">
          {["W","O","R","D","H","O","L","D","S"].map((l,i)=><span key={i}>{l}</span>)}
        </div>
        <p className="eyebrow">A battle of words</p>
        <h1>Wordhold</h1>
        <p className="lede">Find words. Claim the field.<br/>Surround letters to make them yours for good.</p>
      </section>
      <section className="level-picker" aria-labelledby="choose-level">
        <p id="choose-level" className="picker-label">Choose your rival</p>
        {(Object.keys(LABELS) as Difficulty[]).map(level => (
          <button className={`level ${level}`} key={level} onClick={() => newGame(level)}>
            <span className="rival-face">{LABELS[level].face}</span>
            <span><b>{LABELS[level].name}</b><small>{LABELS[level].note}</small></span>
            <span className="arrow">→</span>
          </button>
        ))}
      </section>
      <button className="text-button" onClick={() => setScreen("rules")}>How to play</button>
    </main>
  );

  if (screen === "rules") return (
    <main className="rules-shell">
      <button className="back" onClick={() => setScreen("home")} aria-label="Back">←</button>
      <p className="eyebrow">Three simple rules</p>
      <h2>Hold the field</h2>
      <div className="rules-list">
        <article><span>1</span><div><h3>Make a word</h3><p>Tap letters in any order. Every letter you use becomes yours.</p></div></article>
        <article><span>2</span><div><h3>Steal their letters</h3><p>Use a rival’s letter in your word and it changes to your color.</p></div></article>
        <article><span>3</span><div><h3>Build a stronghold</h3><p>Surround a letter with your color to lock it. Locked letters can’t be stolen.</p></div></article>
      </div>
      <button className="primary" onClick={() => newGame("relaxed")}>Play a relaxed game</button>
    </main>
  );

  return (
    <main className="game-shell">
      <header className="game-topbar">
        <button className="icon-button" onClick={() => setScreen("home")} aria-label="Back to menu">←</button>
        <div className="wordmark">WORDHOLD</div>
        <button className="icon-button restart" onClick={() => newGame()} aria-label="New game">↻</button>
      </header>

      <section className="scoreboard">
        <div className="player you"><span className="face">YOU</span><strong>{yourScore}</strong></div>
        <div className="turn-status"><span className={turn}></span>{turn === "you" ? "your turn" : turn === "rival" ? "thinking" : "game over"}</div>
        <div className={`player rival ${difficulty}`}><span className="face">{LABELS[difficulty].face}</span><strong>{rivalScore}</strong><small>{LABELS[difficulty].name}</small></div>
      </section>

      <section className="play-area">
        {currentWord ? (
          <div className="word-builder" aria-live="polite">
            <div className="word-actions">
              <button className="clear-word" onClick={() => setSelected([])}>Clear</button>
              <button className="submit-word" disabled={turn !== "you" || currentWord.length < 2} onClick={submit}>Submit</button>
            </div>
            <div className="assembled-word" aria-label={`Selected word: ${currentWord}`}>
              {selected.map(i => (
                <button
                  key={i}
                  className={`word-letter owner-${owners[i]} ${locked[i] ? "locked" : ""}`}
                  onClick={() => setSelected(s => s.filter(x => x !== i))}
                  aria-label={`Remove ${letters[i]} from word`}
                >{letters[i]}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="word-tray" aria-live="polite"><span>{message}</span></div>
        )}
        <div className="board" role="grid" aria-label="Letter board">
          {letters.map((letter, i) => {
            const owner = owners[i];
            const isSelected = selected.includes(i);
            return <button
              role="gridcell"
              aria-label={`${letter}${owner === 1 ? ", yours" : owner === 2 ? ", rival’s" : ""}${locked[i] ? ", locked" : ""}`}
              aria-pressed={isSelected}
              disabled={turn !== "you"}
              className={`tile owner-${owner} ${locked[i] ? "locked" : ""} ${isSelected ? "vacated" : ""}`}
              key={i}
              onClick={() => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])}
            >{letter}{locked[i] && <i>◆</i>}</button>;
          })}
        </div>
      </section>

      <footer className="game-controls">
        <div className="last-play">{played.length ? <><span className={played.at(-1)?.owner === 1 ? "blue-dot" : "coral-dot"}></span>{played.at(-1)?.word.toUpperCase()}</> : "First move is yours"}</div>
        {turn === "done" && <button className="primary" onClick={() => newGame()}>Play again</button>}
      </footer>
    </main>
  );
}
