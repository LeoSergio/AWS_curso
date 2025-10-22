import React, { useState, useEffect } from 'react';
// Ícones para Ações
import { Sword, Shield, Heart, Package, ChevronRight, Zap } from 'lucide-react';

// --- Banco de Dados Simples de Pokémon ---
// Dados base para alguns Pokémon
const pokemonData = {
  // Player
  25: { name: 'Pikachu', baseHp: 35, baseAttack: 55, baseDefense: 40, emoji: '⚡️' },
  // Rota 1
  16: { name: 'Pidgey', baseHp: 40, baseAttack: 45, baseDefense: 40, emoji: '🐦' },
  19: { name: 'Rattata', baseHp: 30, baseAttack: 56, baseDefense: 35, emoji: '🐭' },
  // Floresta
  10: { name: 'Caterpie', baseHp: 45, baseAttack: 30, baseDefense: 35, emoji: '🐛' },
  13: { name: 'Weedle', baseHp: 40, baseAttack: 35, baseDefense: 30, emoji: '🐛' },
  // Caverna
  74: { name: 'Geodude', baseHp: 40, baseAttack: 80, baseDefense: 100, emoji: '🪨' },
  41: { name: 'Zubat', baseHp: 40, baseAttack: 45, baseDefense: 35, emoji: '🦇' },
  // Rota Final
  143: { name: 'Snorlax', baseHp: 160, baseAttack: 110, baseDefense: 65, emoji: '😴' }, // Mini-Boss
  // Boss Final
  149: { name: 'Dragonite', baseHp: 91, baseAttack: 134, baseDefense: 95, emoji: '🐉' } 
};

// Helper para obter a URL da imagem oficial do Pokémon
const getSpriteUrl = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

// --- Componente Principal ---
const App = () => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, battle, shop, gameover, victory
  
  // O "jogador" agora representa o Pokémon parceiro
  const [player, setPlayer] = useState({
    name: 'Treinador',
    level: 5,
    hp: 0,
    maxHp: 0,
    attack: 0,
    defense: 0,
    gold: 100, // PokéDollars
    exp: 0,
    expToLevel: 100,
    potions: 3,
    pokeballs: 5,
    pokemonName: 'Pikachu',
    pokemonId: 25,
    pokemonSpriteUrl: getSpriteUrl(25)
  });
  
  const [currentLocation, setCurrentLocation] = useState(0);
  const [enemy, setEnemy] = useState(null); // O Pokémon selvagem
  const [battleLog, setBattleLog] = useState([]);
  const [enemiesDefeated, setEnemiesDefeated] = useState(0);

  // --- Definições do Jogo ---
  const locations = [
    { name: 'Rota 1', bg: 'bg-gradient-to-b from-green-700 to-green-500', pokemonIds: [16, 19] },
    { name: 'Floresta de Viridian', bg: 'bg-gradient-to-b from-green-900 to-green-700', pokemonIds: [10, 13, 16] },
    { name: 'Mt. Moon', bg: 'bg-gradient-to-b from-gray-800 to-gray-600', pokemonIds: [74, 41] },
    { name: 'Rota 12 (Ponte)', bg: 'bg-gradient-to-b from-blue-700 to-blue-500', pokemonIds: [143] }, // Snorlax
    { name: 'Liga Pokémon', bg: 'bg-gradient-to-b from-red-900 to-red-700', bossId: 149 } // Dragonite
  ];

  const shopItems = [
    { name: 'Comprar Poção', cost: 30, effect: () => {
      setPlayer(p => ({ ...p, potions: p.potions + 1, gold: p.gold - 30 }));
    }},
    { name: 'Comprar Pokébola', cost: 20, effect: () => {
      setPlayer(p => ({ ...p, pokeballs: p.pokeballs + 1, gold: p.gold - 20 }));
    }},
    { name: 'Proteína (+2 ATK)', cost: 100, effect: () => {
      setPlayer(p => ({ ...p, attack: p.attack + 2, gold: p.gold - 100 }));
    }},
    { name: 'Ferro (+2 DEF)', cost: 100, effect: () => {
      setPlayer(p => ({ ...p, defense: p.defense + 2, gold: p.gold - 100 }));
    }}
  ];

  // --- Funções de Jogo ---

  // Calcula os stats baseado no nível
  const calculateStats = (pokemonId, level) => {
    const data = pokemonData[pokemonId];
    return {
      hp: Math.floor(data.baseHp + (level * 4.5)),
      maxHp: Math.floor(data.baseHp + (level * 4.5)),
      attack: Math.floor(data.baseAttack + (level * 1.8)),
      defense: Math.floor(data.baseDefense + (level * 1.6)),
    };
  };
  
  const startGame = () => {
    const starterId = 25; // Pikachu
    const baseLevel = 5;
    const stats = calculateStats(starterId, baseLevel);

    setPlayer({
      name: 'Treinador',
      level: baseLevel,
      ...stats,
      gold: 100,
      exp: 0,
      expToLevel: 100,
      potions: 3,
      pokeballs: 5,
      pokemonName: pokemonData[starterId].name,
      pokemonId: starterId,
      pokemonSpriteUrl: getSpriteUrl(starterId)
    });
    
    setGameState('playing');
    setCurrentLocation(0);
    setEnemiesDefeated(0);
  };

  const startBattle = () => {
    const loc = locations[currentLocation];
    const enemyId = loc.bossId ? loc.bossId : loc.pokemonIds[Math.floor(Math.random() * loc.pokemonIds.length)];
    const enemyLevel = loc.bossId ? 30 : Math.max(3, player.level - 2 + Math.floor(Math.random() * 5));
    const enemyStats = calculateStats(enemyId, enemyLevel);
    
    setEnemy({
      ...enemyStats,
      name: pokemonData[enemyId].name,
      id: enemyId,
      spriteUrl: getSpriteUrl(enemyId),
      level: enemyLevel,
      gold: enemyLevel * 10,
      exp: enemyLevel * 12,
      emoji: pokemonData[enemyId].emoji
    });
    setBattleLog([`Um ${pokemonData[enemyId].name} selvagem apareceu!`]);
    setGameState('battle');
  };

  // --- Funções de Batalha ---

  const playerAttack = () => {
    if (!enemy) return;
    
    const damage = Math.max(1, player.attack - enemy.defense + Math.floor(Math.random() * 10));
    const newEnemyHp = enemy.hp - damage;
    
    setBattleLog(prev => [...prev, `${player.pokemonName} atacou e causou ${damage} de dano!`]);
    
    if (newEnemyHp <= 0) {
      const loc = locations[currentLocation];
      setTimeout(() => {
        setBattleLog(prev => [...prev, `O ${enemy.name} inimigo desmaiou!`]);
        const newGold = player.gold + enemy.gold;
        const newExp = player.exp + enemy.exp;
        const newEnemiesDefeated = enemiesDefeated + 1;
        
        setPlayer(p => ({ ...p, gold: newGold, exp: newExp }));
        setEnemiesDefeated(newEnemiesDefeated);
        
        if (newExp >= player.expToLevel) {
          levelUp(newExp);
        }
        
        setTimeout(() => {
          // Verifica se era o boss final
          if (currentLocation === (locations.length - 1) && enemy.id === loc.bossId) {
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
    if (currentEnemyHp <= 0 || !enemy) return;
    
    const damage = Math.max(1, enemy.attack - player.defense + Math.floor(Math.random() * 8));
    const newHp = player.hp - damage;
    
    setBattleLog(prev => [...prev, `${enemy.name} inimigo atacou e causou ${damage} de dano!`]);
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
      setBattleLog(prev => [...prev, `Você usou uma Poção e recuperou ${healAmount} HP!`]);
      
      setTimeout(() => {
        if(enemy) {
          enemyAttack(enemy.hp);
        }
      }, 800);
    }
  };

  const throwPokeball = () => {
    if (player.pokeballs <= 0) {
      setBattleLog(prev => [...prev, "Você está sem Pokébolas!"]);
      return;
    }
    // Não pode capturar o boss
    if (locations[currentLocation].bossId === enemy.id) {
       setBattleLog(prev => [...prev, "Você não pode capturar este Pokémon!"]);
       setTimeout(() => enemyAttack(enemy.hp), 800);
       return;
    }

    setPlayer(p => ({ ...p, pokeballs: p.pokeballs - 1 }));
    setBattleLog(prev => [...prev, `Você jogou uma Pokébola...`]);

    const catchRate = 0.4; // Taxa base
    const hpFactor = (enemy.maxHp - enemy.hp) / enemy.maxHp; // 0 (cheio) a 1 (vazio)
    const catchChance = catchRate + (hpFactor * 0.5); // Max 90% se HP baixo, 40% se HP cheio

    setTimeout(() => {
      if (Math.random() < catchChance) {
        setBattleLog(prev => [...prev, `...Gotcha! ${enemy.name} foi capturado!`]);
        // Bônus por captura
        setPlayer(p => ({ ...p, exp: p.exp + (enemy.exp / 2) }));
        setTimeout(() => {
          setGameState('playing');
          setEnemy(null);
        }, 1500);
      } else {
        setBattleLog(prev => [...prev, `...Ah! O Pokémon escapou!`]);
        setTimeout(() => enemyAttack(enemy.hp), 800);
      }
    }, 1000);
  };


  const levelUp = (currentExp) => {
    const partnerData = pokemonData[player.pokemonId];
    const newLevel = player.level + 1;
    const newStats = calculateStats(player.pokemonId, newLevel);
    
    setPlayer(p => ({
      ...p,
      level: newLevel,
      maxHp: newStats.maxHp,
      hp: newStats.maxHp, // Cura total no level up
      attack: newStats.attack,
      defense: newStats.defense,
      exp: currentExp - p.expToLevel,
      expToLevel: Math.floor(p.expToLevel * 1.5)
    }));
    
    setBattleLog(prev => [...prev, `🎉 ${player.pokemonName} subiu para o nível ${newLevel}!`]);
  };

  const advanceLocation = () => {
    if (currentLocation < locations.length - 1) {
      setCurrentLocation(currentLocation + 1);
    }
  };

  // --- Funções de Renderização (UI) ---

  const renderMenu = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 via-blue-600 to-yellow-400 flex items-center justify-center p-4 text-white">
      <div className="text-center">
        <div className="mb-8 text-8xl animate-bounce">✨</div>
        <h1 className="text-6xl font-bold text-yellow-300 mb-4 drop-shadow-lg" style={{fontFamily: "'Press Start 2P', cursive"}}>
          Aventura Pokémon
        </h1>
        <p className="text-2xl text-blue-200 mb-8">
          Torne-se um Mestre Pokémon!
        </p>
        <button
          onClick={startGame}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-blue-900 px-12 py-4 rounded-full text-2xl font-bold hover:scale-110 transform transition shadow-2xl"
        >
          Iniciar Aventura
        </button>
      </div>
    </div>
  );

  const renderPlaying = () => {
    const loc = locations[currentLocation];
    return (
      <div className={`min-h-screen ${loc.bg} p-6 text-white`}>
        <div className="max-w-4xl mx-auto">
          {/* Player Stats */}
          <div className="bg-black bg-opacity-60 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-4">
                <img src={player.pokemonSpriteUrl} alt={player.pokemonName} className="w-20 h-20" />
                <div>
                  <div className="text-xl font-bold text-yellow-300">
                    {player.pokemonName} - Nível {player.level}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-300">
                    <span className="flex items-center gap-1">
                      <Sword size={16} /> {player.attack}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield size={16} /> {player.defense}
                    </span>
                    <span className="flex items-center gap-1">
                      💰 ${player.gold}
                    </span>
                    <span className="flex items-center gap-1">
                      🧪 {player.potions}
                    </span>
                    <span className="flex items-center gap-1">
                      🔴 {player.pokeballs}
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
                    className="bg-gradient-to-r from-green-500 to-green-300 h-3 rounded-full transition-all"
                    style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-blue-300 mt-1">
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
            <div className="text-8xl mb-6">❓</div>
            <p className="text-xl text-gray-300 mb-6">
              Você está explorando a {loc.name}. O que deseja fazer?
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={startBattle}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 rounded-lg text-xl font-bold flex items-center gap-2 shadow-lg transform hover:scale-105 transition"
              >
                <Zap /> Procurar Pokémon
              </button>
              
              <button
                onClick={() => setGameState('shop')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-xl font-bold flex items-center gap-2 shadow-lg transform hover:scale-105 transition"
              >
                <Package /> PokéMart
              </button>
              
              {currentLocation < locations.length - 1 && enemiesDefeated > currentLocation && (
                <button
                  onClick={advanceLocation}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-xl font-bold flex items-center gap-2 shadow-lg transform hover:scale-105 transition"
                >
                  <ChevronRight /> Próxima Rota
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBattle = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 p-6 text-white flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full">
        {/* Enemy */}
        {enemy && (
          <div className="text-center mb-4">
            <img src={enemy.spriteUrl} alt={enemy.name} className="w-48 h-48 mx-auto drop-shadow-lg" />
            <div className="bg-black bg-opacity-60 rounded-lg p-3 inline-block">
              <h2 className="text-2xl font-bold text-red-400">{enemy.name} - Nv. {enemy.level}</h2>
              <div className="flex justify-center items-center gap-2 mb-1">
                <Heart className="text-red-500" />
                <span className="text-lg font-bold text-white">{enemy.hp}/{enemy.maxHp}</span>
              </div>
              <div className="w-64 bg-gray-700 rounded-full h-4 mx-auto">
                <div 
                  className="bg-gradient-to-r from-red-600 to-red-400 h-4 rounded-full transition-all"
                  style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Player */}
        <div className="flex justify-end items-center mb-4">
          <div className="bg-black bg-opacity-60 rounded-lg p-3 text-right">
            <h2 className="text-2xl font-bold text-yellow-300">{player.pokemonName} - Nv. {player.level}</h2>
            <div className="flex justify-end items-center gap-2 mb-1">
              <Heart className="text-red-500" />
              <span className="text-lg font-bold text-white">{player.hp}/{player.maxHp}</span>
            </div>
            <div className="w-64 bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-300 h-4 rounded-full transition-all"
                style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
              />
            </div>
          </div>
          <img src={player.pokemonSpriteUrl} alt={player.pokemonName} className="w-40 h-40 drop-shadow-lg" />
        </div>
      </div>
      
      {/* Log e Ações */}
      <div className="max-w-4xl mx-auto w-full">
        {/* Battle Log */}
        <div className="bg-black bg-opacity-80 rounded-lg p-4 mb-4 h-32 overflow-y-auto border-2 border-gray-600">
          {battleLog.map((log, i) => (
            <div key={i} className="text-gray-300 mb-1">{log}</div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={playerAttack}
            disabled={!enemy || enemy.hp <= 0 || player.hp <= 0}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white p-4 rounded-lg text-xl font-bold flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 transition"
          >
            <Sword /> Lutar
          </button>
          <button
            onClick={throwPokeball}
            disabled={!enemy || enemy.hp <= 0 || player.hp <= 0 || player.pokeballs <= 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-4 rounded-lg text-xl font-bold flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 transition"
          >
            🔴 Capturar ({player.pokeballs})
          </button>
          <button
            onClick={usePotion}
            disabled={player.potions <= 0 || player.hp >= player.maxHp || !enemy || enemy.hp <= 0 || player.hp <= 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white p-4 rounded-lg text-xl font-bold shadow-lg transform hover:scale-105 transition"
          >
            🧪 Poção ({player.potions})
          </button>
          <button
            onClick={() => { setGameState('playing'); setEnemy(null); }} // Botão de Fuga
            disabled={!enemy || enemy.hp <= 0 || player.hp <= 0}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-800 text-white p-4 rounded-lg text-xl font-bold shadow-lg transform hover:scale-105 transition"
          >
            Fugir
          </button>
        </div>
      </div>
    </div>
  );

  const renderShop = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-yellow-300 text-center mb-6">
          🏪 PokéMart
        </h2>
        
        <div className="bg-black bg-opacity-60 rounded-lg p-4 mb-6 text-center">
          <div className="text-2xl text-yellow-300">Seu Dinheiro: 💰 ${player.gold}</div>
        </div>

        <div className="grid gap-4 mb-6">
          {shopItems.map((item, i) => (
            <div key={i} className="bg-black bg-opacity-60 rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="text-xl font-bold text-white">{item.name}</div>
                <div className="text-yellow-400">💰 ${item.cost}</div>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4 text-white">
      <div className="text-center">
        <div className="text-8xl mb-6">💀</div>
        <h2 className="text-5xl font-bold text-gray-400 mb-4">Você desmaiou!</h2>
        <p className="text-xl text-gray-300 mb-8">
          Seu Pokémon foi derrotado... Você correu para o Centro Pokémon mais próximo.
        </p>
        <button
          onClick={startGame} // Reinicia o jogo
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-xl font-bold"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );

  const renderVictory = () => (
    <div className="min-h-screen bg-gradient-to-b from-yellow-600 via-orange-500 to-red-600 flex items-center justify-center p-4 text-white">
      <div className="text-center">
        <div className="text-8xl mb-6 animate-bounce">🏆</div>
        <h2 className="text-5xl font-bold text-yellow-300 mb-4">VITÓRIA!</h2>
        <p className="text-2xl text-white mb-8">
          Você derrotou o Pokémon final e se tornou um Mestre!
        </p>
        <div className="text-xl text-yellow-200 mb-8">
          Nível Final: {player.level} | Dinheiro: ${player.gold}
        </div>
        <button
          onClick={startGame}
          className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-8 py-3 rounded-lg text-xl font-bold"
        >
          Jogar Novamente
        </button>
      </div>
    </div>
  );

  // --- Efeito para calcular stats do jogador na inicialização ---
  useEffect(() => {
    startGame();
  }, []); // Roda apenas uma vez quando o componente é montado

  // --- Renderização Principal ---
  return (
    <div className="font-sans">
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


