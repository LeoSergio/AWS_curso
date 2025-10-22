import React, { useState, useEffect } from 'react';
import { Sword, Shield, Heart, Zap, Map, Package, Skull, Trophy, ChevronRight } from 'lucide-react';

const App = () => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, battle, shop, gameover, victory
  const [player, setPlayer] = useState({
    name: 'Herói',
    level: 1,
    hp: 100,
    maxHp: 100,
    attack: 15,
    defense: 10,
    gold: 50,
    exp: 0,
    expToLevel: 100,
    potions: 3
  });
  
  const [currentLocation, setCurrentLocation] = useState(0);
  const [enemy, setEnemy] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [enemiesDefeated, setEnemiesDefeated] = useState(0);

  const locations = [
    { name: 'Floresta Sombria', bg: 'bg-gradient-to-b from-green-900 to-green-700', enemyType: 'Goblin' },
    { name: 'Caverna Profunda', bg: 'bg-gradient-to-b from-gray-800 to-gray-600', enemyType: 'Morcego Gigante' },
    { name: 'Ruínas Antigas', bg: 'bg-gradient-to-b from-amber-900 to-amber-700', enemyType: 'Esqueleto' },
    { name: 'Torre Maldita', bg: 'bg-gradient-to-b from-purple-900 to-purple-700', enemyType: 'Necromante' },
    { name: 'Covil do Dragão', bg: 'bg-gradient-to-b from-red-900 to-red-700', enemyType: 'Dragão' }
  ];

  const enemyTypes = {
    'Goblin': { hp: 40, attack: 10, defense: 5, gold: 20, exp: 30, emoji: '👺' },
    'Morcego Gigante': { hp: 60, attack: 15, defense: 7, gold: 35, exp: 50, emoji: '🦇' },
    'Esqueleto': { hp: 80, attack: 20, defense: 10, gold: 50, exp: 70, emoji: '💀' },
    'Necromante': { hp: 120, attack: 30, defense: 15, gold: 80, exp: 100, emoji: '🧙' },
    'Dragão': { hp: 200, attack: 40, defense: 20, gold: 200, exp: 300, emoji: '🐉' }
  };

  const shopItems = [
    { name: 'Poção de Vida', cost: 30, effect: () => {
      setPlayer(p => ({ ...p, hp: Math.min(p.hp + 50, p.maxHp), gold: p.gold - 30, potions: p.potions + 1 }));
    }},
    { name: 'Espada Afiada (+5 ATK)', cost: 100, effect: () => {
      setPlayer(p => ({ ...p, attack: p.attack + 5, gold: p.gold - 100 }));
    }},
    { name: 'Armadura (+5 DEF)', cost: 100, effect: () => {
      setPlayer(p => ({ ...p, defense: p.defense + 5, gold: p.gold - 100 }));
    }}
  ];

  const startGame = () => {
    setGameState('playing');
    setCurrentLocation(0);
    setPlayer({
      name: 'Herói',
      level: 1,
      hp: 100,
      maxHp: 100,
      attack: 15,
      defense: 10,
      gold: 50,
      exp: 0,
      expToLevel: 100,
      potions: 3
    });
    setEnemiesDefeated(0);
  };

  const startBattle = () => {
    const loc = locations[currentLocation];
    const enemyData = enemyTypes[loc.enemyType];
    const levelBonus = currentLocation * 0.3;
    
    setEnemy({
      name: loc.enemyType,
      hp: Math.floor(enemyData.hp * (1 + levelBonus)),
      maxHp: Math.floor(enemyData.hp * (1 + levelBonus)),
      attack: Math.floor(enemyData.attack * (1 + levelBonus)),
      defense: Math.floor(enemyData.defense * (1 + levelBonus)),
      gold: Math.floor(enemyData.gold * (1 + levelBonus)),
      exp: Math.floor(enemyData.exp * (1 + levelBonus)),
      emoji: enemyData.emoji
    });
    setBattleLog([`Um ${loc.enemyType} selvagem apareceu!`]);
    setGameState('battle');
  };

  const playerAttack = () => {
    if (!enemy) return;
    
    const damage = Math.max(1, player.attack - enemy.defense + Math.floor(Math.random() * 10));
    const newEnemyHp = enemy.hp - damage;
    
    setBattleLog(prev => [...prev, `Você atacou e causou ${damage} de dano!`]);
    
    if (newEnemyHp <= 0) {
      setTimeout(() => {
        setBattleLog(prev => [...prev, `Você derrotou o ${enemy.name}!`]);
        const newGold = player.gold + enemy.gold;
        const newExp = player.exp + enemy.exp;
        const newEnemiesDefeated = enemiesDefeated + 1;
        
        setPlayer(p => ({ ...p, gold: newGold, exp: newExp }));
        setEnemiesDefeated(newEnemiesDefeated);
        
        if (newExp >= player.expToLevel) {
          levelUp(newExp);
        }
        
        setTimeout(() => {
          if (currentLocation === 4) {
            setGameState('victory');
          } else {
            setGameState('playing');
            setEnemy(null);
          }
        }, 1500);
      }, 500);
      
      setEnemy({ ...enemy, hp: 0 });
    } else {
      setEnemy({ ...enemy, hp: newEnemyHp });
      
      setTimeout(() => {
        enemyAttack(newEnemyHp);
      }, 800);
    }
  };

  const enemyAttack = (currentEnemyHp) => {
    if (currentEnemyHp <= 0) return;
    
    const damage = Math.max(1, enemy.attack - player.defense + Math.floor(Math.random() * 8));
    const newHp = player.hp - damage;
    
    setBattleLog(prev => [...prev, `${enemy.name} atacou e causou ${damage} de dano!`]);
    setPlayer(p => ({ ...p, hp: newHp }));
    
    if (newHp <= 0) {
      setTimeout(() => {
        setGameState('gameover');
      }, 1000);
    }
  };

  const usePotion = () => {
    if (player.potions > 0 && player.hp < player.maxHp) {
      const healAmount = 50;
      setPlayer(p => ({ 
        ...p, 
        hp: Math.min(p.hp + healAmount, p.maxHp),
        potions: p.potions - 1
      }));
      setBattleLog(prev => [...prev, `Você usou uma poção e recuperou ${healAmount} HP!`]);
      
      setTimeout(() => {
        enemyAttack(enemy.hp);
      }, 800);
    }
  };

  const levelUp = (currentExp) => {
    const newLevel = player.level + 1;
    const newMaxHp = player.maxHp + 20;
    
    setPlayer(p => ({
      ...p,
      level: newLevel,
      maxHp: newMaxHp,
      hp: newMaxHp,
      attack: p.attack + 5,
      defense: p.defense + 3,
      exp: currentExp - p.expToLevel,
      expToLevel: Math.floor(p.expToLevel * 1.5)
    }));
    
    setBattleLog(prev => [...prev, `🎉 LEVEL UP! Você alcançou o nível ${newLevel}!`]);
  };

  const advanceLocation = () => {
    if (currentLocation < locations.length - 1) {
      setCurrentLocation(currentLocation + 1);
    }
  };

  const renderMenu = () => (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8 text-8xl animate-bounce">⚔️</div>
        <h1 className="text-6xl font-bold text-yellow-300 mb-4 drop-shadow-lg">
          Aventura RPG
        </h1>
        <p className="text-2xl text-purple-200 mb-8">
          Derrote todos os inimigos e se torne uma lenda!
        </p>
        <button
          onClick={startGame}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 px-12 py-4 rounded-full text-2xl font-bold hover:scale-110 transform transition shadow-2xl"
        >
          Iniciar Aventura
        </button>
      </div>
    </div>
  );

  const renderPlaying = () => {
    const loc = locations[currentLocation];
    return (
      <div className={`min-h-screen ${loc.bg} p-6`}>
        <div className="max-w-4xl mx-auto">
          {/* Player Stats */}
          <div className="bg-black bg-opacity-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🧑‍⚔️</div>
                <div>
                  <div className="text-xl font-bold text-yellow-300">
                    {player.name} - Nível {player.level}
                  </div>
                  <div className="flex gap-4 text-sm text-gray-300">
                    <span className="flex items-center gap-1">
                      <Sword size={16} /> {player.attack}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield size={16} /> {player.defense}
                    </span>
                    <span className="flex items-center gap-1">
                      💰 {player.gold}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-red-400 mb-1">
                  <Heart size={20} />
                  <span className="font-bold">{player.hp}/{player.maxHp}</span>
                </div>
                <div className="w-48 bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full transition-all"
                    style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-purple-300 mt-1">
                  EXP: {player.exp}/{player.expToLevel}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-black bg-opacity-60 rounded-lg p-6 mb-4 text-center">
            <h2 className="text-3xl font-bold text-yellow-300 mb-4">
              📍 {loc.name}
            </h2>
            <div className="text-8xl mb-6">{enemyTypes[loc.enemyType].emoji}</div>
            <p className="text-xl text-gray-300 mb-6">
              Você encontrou um território perigoso. O que deseja fazer?
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={startBattle}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-xl font-bold flex items-center gap-2 shadow-lg transform hover:scale-105 transition"
              >
                <Sword /> Batalhar
              </button>
              
              <button
                onClick={() => setGameState('shop')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-xl font-bold flex items-center gap-2 shadow-lg transform hover:scale-105 transition"
              >
                <Package /> Loja
              </button>
              
              {currentLocation < locations.length - 1 && enemiesDefeated > currentLocation && (
                <button
                  onClick={advanceLocation}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-xl font-bold flex items-center gap-2 shadow-lg transform hover:scale-105 transition"
                >
                  <ChevronRight /> Avançar
                </button>
              )}
            </div>

            <div className="mt-4 text-yellow-300">
              Inimigos derrotados: {enemiesDefeated} | Potions: 🧪 x{player.potions}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBattle = () => (
    <div className="min-h-screen bg-gradient-to-b from-red-900 to-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Enemy */}
        <div className="bg-black bg-opacity-60 rounded-lg p-6 mb-4 text-center">
          <div className="text-8xl mb-4 animate-pulse">{enemy.emoji}</div>
          <h2 className="text-3xl font-bold text-red-400 mb-2">{enemy.name}</h2>
          <div className="flex justify-center items-center gap-2 mb-2">
            <Heart className="text-red-500" />
            <span className="text-xl font-bold text-white">{enemy.hp}/{enemy.maxHp}</span>
          </div>
          <div className="w-64 bg-gray-700 rounded-full h-4 mx-auto">
            <div 
              className="bg-gradient-to-r from-red-600 to-red-400 h-4 rounded-full transition-all"
              style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-gray-400 text-sm">
            ATK: {enemy.attack} | DEF: {enemy.defense}
          </div>
        </div>

        {/* Battle Log */}
        <div className="bg-black bg-opacity-60 rounded-lg p-4 mb-4 h-40 overflow-y-auto">
          {battleLog.map((log, i) => (
            <div key={i} className="text-gray-300 mb-1">{log}</div>
          ))}
        </div>

        {/* Player */}
        <div className="bg-black bg-opacity-60 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🧑‍⚔️</div>
              <div>
                <div className="text-xl font-bold text-yellow-300">{player.name}</div>
                <div className="flex items-center gap-2 text-red-400">
                  <Heart size={16} />
                  <span>{player.hp}/{player.maxHp}</span>
                </div>
              </div>
            </div>
            <div className="w-48 bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all"
                style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={playerAttack}
            disabled={enemy.hp <= 0}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-8 py-4 rounded-lg text-xl font-bold flex items-center gap-2 shadow-lg transform hover:scale-105 transition"
          >
            <Sword /> Atacar
          </button>
          
          <button
            onClick={usePotion}
            disabled={player.potions <= 0 || player.hp >= player.maxHp}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-8 py-4 rounded-lg text-xl font-bold shadow-lg transform hover:scale-105 transition"
          >
            🧪 Poção ({player.potions})
          </button>
        </div>
      </div>
    </div>
  );

  const renderShop = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-yellow-300 text-center mb-6">
          🏪 Loja do Mercador
        </h2>
        
        <div className="bg-black bg-opacity-60 rounded-lg p-4 mb-6 text-center">
          <div className="text-2xl text-yellow-300">Seu ouro: 💰 {player.gold}</div>
        </div>

        <div className="grid gap-4 mb-6">
          {shopItems.map((item, i) => (
            <div key={i} className="bg-black bg-opacity-60 rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="text-xl font-bold text-white">{item.name}</div>
                <div className="text-yellow-400">💰 {item.cost} ouro</div>
              </div>
              <button
                onClick={item.effect}
                disabled={player.gold < item.cost}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold"
              >
                Comprar
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => setGameState('playing')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-xl font-bold w-full"
        >
          Voltar
        </button>
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="min-h-screen bg-gradient-to-b from-red-900 to-black flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl mb-6">💀</div>
        <h2 className="text-5xl font-bold text-red-400 mb-4">Game Over</h2>
        <p className="text-xl text-gray-300 mb-8">
          Você derrotou {enemiesDefeated} inimigos antes de cair em batalha.
        </p>
        <button
          onClick={startGame}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-xl font-bold"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );

  const renderVictory = () => (
    <div className="min-h-screen bg-gradient-to-b from-yellow-600 via-orange-500 to-red-600 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl mb-6 animate-bounce">🏆</div>
        <h2 className="text-5xl font-bold text-yellow-300 mb-4">VITÓRIA!</h2>
        <p className="text-2xl text-white mb-8">
          Você derrotou todos os inimigos e se tornou uma lenda!
        </p>
        <div className="text-xl text-yellow-200 mb-8">
          Nível Final: {player.level} | Ouro: {player.gold} | Inimigos derrotados: {enemiesDefeated}
        </div>
        <button
          onClick={startGame}
          className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 px-8 py-3 rounded-lg text-xl font-bold"
        >
          Jogar Novamente
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {gameState === 'menu' && renderMenu()}
      {gameState === 'playing' && renderPlaying()}
      {gameState === 'battle' && renderBattle()}
      {gameState === 'shop' && renderShop()}
      {gameState === 'gameover' && renderGameOver()}
      {gameState === 'victory' && renderVictory()}
    </div>
  );
};

export default App;