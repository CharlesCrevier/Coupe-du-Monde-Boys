// ============================================================
// ITCILO World Cup 2026 - Tournament Data
// ============================================================

// Cloud sync — create a free account at jsonbin.io, make a bin with
// content {"users":[]}, then paste the Bin ID and Master Key below.
const CLOUD_BIN_ID  = '';   // e.g. '6837abc1acd3cb34a8123456'
const CLOUD_API_KEY = '';   // Master Key from jsonbin.io → API Keys

const GROUPS = {
  A: ['MEX', 'KOR', 'RSA', 'CZE'],
  B: ['CAN', 'BIH', 'QAT', 'CHE'],
  C: ['BRA', 'MAR', 'SCO', 'HAI'],
  D: ['USA', 'PAR', 'AUS', 'TUR'],
  E: ['GER', 'CUW', 'CIV', 'ECU'],
  F: ['NED', 'JPN', 'SWE', 'TUN'],
  G: ['BEL', 'IRN', 'EGY', 'NZL'],
  H: ['ESP', 'URU', 'KSA', 'CPV'],
  I: ['FRA', 'SEN', 'NOR', 'IRQ'],
  J: ['ARG', 'AUT', 'ALG', 'JOR'],
  K: ['POR', 'COD', 'UZB', 'COL'],
  L: ['ENG', 'CRO', 'PAN', 'GHA'],
};

// ============================================================
// KNOCKOUT BRACKET — official 2026 FIFA World Cup draw
// 32 teams advance: top 2 from each of 12 groups (24) + best 8 third-placed teams (8)
// 32 knockout matches: R32(16) + R16(8) + QF(4) + SF(2) + 3rd place(1) + Final(1)
// ============================================================

// R32: 16 matches — matches 73-88 per official draw (December 5, 2025)
// slot1/slot2: '1X' = group X winner, '2X' = group X runner-up, '3rd-N' = Nth best 3rd-placed team
// thirdLabel shows which groups' 3rd-placed teams are eligible for that slot
const R32_BRACKET = [
  { id: 'R32_1',  slot1: '2A', slot2: '2B' },                                          // M73
  { id: 'R32_2',  slot1: '1E', slot2: '3rd-1', thirdLabel: 'Best 3rd (A/B/C/D/F)' },  // M74
  { id: 'R32_3',  slot1: '1F', slot2: '2C' },                                          // M75
  { id: 'R32_4',  slot1: '1C', slot2: '2F' },                                          // M76
  { id: 'R32_5',  slot1: '1I', slot2: '3rd-2', thirdLabel: 'Best 3rd (C/D/F/G/H)' },  // M77
  { id: 'R32_6',  slot1: '2E', slot2: '2I' },                                          // M78
  { id: 'R32_7',  slot1: '1A', slot2: '3rd-3', thirdLabel: 'Best 3rd (C/E/F/H/I)' },  // M79
  { id: 'R32_8',  slot1: '1L', slot2: '3rd-4', thirdLabel: 'Best 3rd (E/H/I/J/K)' },  // M80
  { id: 'R32_9',  slot1: '1D', slot2: '3rd-5', thirdLabel: 'Best 3rd (B/E/F/I/J)' },  // M81
  { id: 'R32_10', slot1: '1G', slot2: '3rd-6', thirdLabel: 'Best 3rd (A/E/H/I/J)' },  // M82
  { id: 'R32_11', slot1: '2K', slot2: '2L' },                                          // M83
  { id: 'R32_12', slot1: '1H', slot2: '2J' },                                          // M84
  { id: 'R32_13', slot1: '1B', slot2: '3rd-7', thirdLabel: 'Best 3rd (E/F/G/I/J)' },  // M85
  { id: 'R32_14', slot1: '1J', slot2: '2H' },                                          // M86
  { id: 'R32_15', slot1: '1K', slot2: '3rd-8', thirdLabel: 'Best 3rd (D/E/I/J/L)' },  // M87
  { id: 'R32_16', slot1: '2D', slot2: '2G' },                                          // M88
];

// R16: 8 matches — matches 89-96
const R16_BRACKET = [
  { id: 'R16_1', from: ['R32_1',  'R32_3']  },  // M89: W73 vs W75
  { id: 'R16_2', from: ['R32_2',  'R32_5']  },  // M90: W74 vs W77
  { id: 'R16_3', from: ['R32_4',  'R32_6']  },  // M91: W76 vs W78
  { id: 'R16_4', from: ['R32_7',  'R32_8']  },  // M92: W79 vs W80
  { id: 'R16_5', from: ['R32_11', 'R32_12'] },  // M93: W83 vs W84
  { id: 'R16_6', from: ['R32_9',  'R32_10'] },  // M94: W81 vs W82
  { id: 'R16_7', from: ['R32_14', 'R32_16'] },  // M95: W86 vs W88
  { id: 'R16_8', from: ['R32_13', 'R32_15'] },  // M96: W85 vs W87
];

// QF: 4 matches — matches 97-100
const QF_BRACKET = [
  { id: 'QF_1', from: ['R16_1', 'R16_2'] },  // M97: W89 vs W90
  { id: 'QF_2', from: ['R16_5', 'R16_6'] },  // M98: W93 vs W94
  { id: 'QF_3', from: ['R16_3', 'R16_4'] },  // M99: W91 vs W92
  { id: 'QF_4', from: ['R16_7', 'R16_8'] },  // M100: W95 vs W96
];

// SF: 2 matches — matches 101-102
const SF_BRACKET = [
  { id: 'SF_1', from: ['QF_1', 'QF_2'] },  // M101: W97 vs W98
  { id: 'SF_2', from: ['QF_3', 'QF_4'] },  // M102: W99 vs W100
];

// 3rd place: 1 match — match 103 (losers of both semi-finals)
const THIRD_PLACE_BRACKET = [{ id: 'THIRD', loserFrom: ['SF_1', 'SF_2'] }];

// Final: 1 match — match 104 at MetLife Stadium, July 19
const FINAL_BRACKET = [{ id: 'FINAL', from: ['SF_1', 'SF_2'] }];

// Win probability in % (top 15 countries have real values; others share remainder)
const TEAMS = {
  ARG: {
    name: 'Argentina', flag: '🇦🇷', confederation: 'CONMEBOL', probability: 17, fifaRank: 1,
    description: 'The reigning World Cup champions arrive in North America as the team to beat. Built on tactical discipline under Scaloni and featuring Lionel Messi in what may be his final World Cup, Argentina combine world-class individual brilliance with an extraordinary team spirit forged in Qatar 2022. Their South American qualifying campaign was dominant, and they enter as deserved favourites.',
    players: [
      { name: 'Lionel Messi', position: 'Forward / CAM', club: 'Inter Miami', description: 'The greatest player in history completes the picture as a complete champion. His vision, dribbling, and leadership at 38 remain unmatched. The motivation of defending the title he so long craved gives Argentina an emotional edge.' },
      { name: 'Julián Álvarez', position: 'Centre-Forward', club: 'Atlético Madrid', description: 'The relentless pressing and clinical finishing of Álvarez makes him one of the most complete strikers in world football. His La Liga form shows he can carry the team when Messi needs rest.' },
      { name: 'Rodrigo De Paul', position: 'Central Midfielder', club: 'Atlético Madrid', description: 'The engine of the Argentine midfield. De Paul\'s energy, ball-carrying ability, and tactical intelligence have been critical to Argentina\'s back-to-back Copa América and World Cup victories.' },
    ]
  },
  FRA: {
    name: 'France', flag: '🇫🇷', confederation: 'UEFA', probability: 14, fifaRank: 2,
    description: 'Les Bleus remain the most consistently dangerous side in world football. Two recent World Cup finals and a semi-final appearance tell a story of perennial excellence. Despite internal tensions that occasionally surface, France\'s depth of talent across every position is unmatched — they can absorb injuries and still produce multiple world-class alternatives.',
    players: [
      { name: 'Kylian Mbappé', position: 'Centre-Forward / Left Wing', club: 'Real Madrid', description: 'The heir apparent to world football\'s throne. Mbappé\'s electric pace, direct dribbling, and instinctive finishing have already produced World Cup-winning moments. His move to Real Madrid has only elevated his game further.' },
      { name: 'Aurélien Tchouaméni', position: 'Defensive Midfielder', club: 'Real Madrid', description: 'The imposing midfield anchor who protects the French defence with physical dominance and intelligent positioning. His emergence has provided France with the defensive stability their attacking talent demands.' },
      { name: 'Antoine Griezmann', position: 'Attacking Midfielder / Second Striker', club: 'Atlético Madrid', description: 'The tournament player par excellence. Griezmann\'s adaptability, set-piece quality, and big-game temperament make him indispensable in high-pressure knockout football.' },
    ]
  },
  ENG: {
    name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA', probability: 12, fifaRank: 5,
    description: 'After Euro 2024 heartbreak and decades of underachievement, England arrive with arguably their most talented generation ever. The Bellingham-Saka-Kane triangle forms one of the most dangerous attacks in the tournament, while a settled defensive structure gives genuine belief that this time, football really might come home.',
    players: [
      { name: 'Jude Bellingham', position: 'Attacking Midfielder', club: 'Real Madrid', description: 'The complete midfielder of his generation. Bellingham\'s ability to score, create, press, and lead at just 21 years old is extraordinary. Champions League winner at Real Madrid, he arrives at the 2026 World Cup in peak form.' },
      { name: 'Bukayo Saka', position: 'Right Wing / Attacking Midfielder', club: 'Arsenal', description: 'Consistently England\'s most threatening and reliable attacker. Saka\'s directness, two-footedness, and calm under pressure have made him the system\'s creative hub in wide areas.' },
      { name: 'Harry Kane', position: 'Centre-Forward', club: 'Bayern Munich', description: 'England\'s all-time top scorer and one of football\'s most complete strikers. Kane\'s movement, link play, and clinical finishing have been prolific at Bayern, and he is desperate to win a major honour with England.' },
    ]
  },
  BRA: {
    name: 'Brazil', flag: '🇧🇷', confederation: 'CONMEBOL', probability: 11, fifaRank: 4,
    description: 'O Seleção return with renewed hunger after their controversial Qatar quarter-final exit. A new generation built around Vinicius Jr. and the electric Endrick brings the samba flair that Brazilian football has long promised. With Dorival Júnior restoring joy and stability to the dugout, Brazil carry the weight of five World Cup titles and the expectation of 215 million fans.',
    players: [
      { name: 'Vinicius Jr.', position: 'Left Wing / Forward', club: 'Real Madrid', description: 'The most exciting dribbler in world football. Vinicius\'s searing pace, skill, and composure in front of goal have delivered Champions League titles for Real Madrid and now fuel Brazil\'s World Cup dreams. He arrives as a Ballon d\'Or-level performer.' },
      { name: 'Endrick', position: 'Centre-Forward', club: 'Real Madrid', description: 'At just 18, Endrick has already proven he belongs at the highest level. His physical strength, intelligent movement, and composure beyond his years make him one of football\'s most exciting young forwards.' },
      { name: 'Rodrygo', position: 'Right Wing / Second Striker', club: 'Real Madrid', description: 'The big-game player who delivers in moments that matter. Rodrygo\'s Champions League heroics have shown a talent for the dramatic, combining technical excellence with composure and creativity.' },
    ]
  },
  ESP: {
    name: 'Spain', flag: '🇪🇸', confederation: 'UEFA', probability: 10, fifaRank: 3,
    description: 'La Roja\'s evolution from tiki-taka to high-intensity pressing possession football under Luis de la Fuente has produced a side combining technical perfection with modern intensity. Their Euro 2024 triumph signalled the arrival of a new Spanish golden generation, and Lamine Yamal\'s emergence as one of football\'s greatest talents at 17 gives Spain a weapons system previous generations could not match.',
    players: [
      { name: 'Lamine Yamal', position: 'Right Wing', club: 'FC Barcelona', description: 'Widely considered the most complete young talent since Messi. Born the day Spain won Euro 2008, Yamal\'s dribbling, vision, and composure at 17 are simply otherworldly. Euro 2024\'s tournament player. The world stage awaits.' },
      { name: 'Pedri', position: 'Central Midfielder', club: 'FC Barcelona', description: 'The next great Spanish playmaker. Pedri\'s touch, movement between lines, and ability to control rhythm under pressure recalls the best of Xavi and Iniesta. Fully fit, he is Spain\'s creative metronome.' },
      { name: 'Dani Olmo', position: 'Attacking Midfielder / Second Striker', club: 'FC Barcelona', description: 'Euro 2024\'s golden boot winner. Olmo\'s intelligent movement, technical quality, and ability to link play make him decisive in Spain\'s possession system, arriving at 2026 in career-best form.' },
    ]
  },
  GER: {
    name: 'Germany', flag: '🇩🇪', confederation: 'UEFA', probability: 8, fifaRank: 12,
    description: 'Die Nationalmannschaft have rebuilt spectacularly under Julian Nagelsmann. The embarrassing group-stage exits of 2018 and 2022 prompted a root-and-branch rethink, and the emergence of Florian Wirtz and Jamal Musiala as one of football\'s most devastating midfield partnerships heralds a new German golden era. Euro 2024 hosts, they arrive with renewed momentum and home support in memory.',
    players: [
      { name: 'Florian Wirtz', position: 'Attacking Midfielder', club: 'Bayer Leverkusen', description: 'The player who might define German football for a decade. Wirtz\'s creativity, dribbling, and goal contribution at club level have been historic — helping Leverkusen to an unbeaten Bundesliga title. His World Cup debut was sensational; his peak is yet to come.' },
      { name: 'Jamal Musiala', position: 'Attacking Midfielder / Forward', club: 'Bayern Munich', description: 'England-born but emphatically German in his football identity. Musiala\'s instinctive dribbling, unpredictability, and technical mastery draw comparisons to the great German forwards of the past. At 22, he is already a world-class talent.' },
      { name: 'Joshua Kimmich', position: 'Central / Defensive Midfielder', club: 'Bayern Munich', description: 'Germany\'s heartbeat and captain. Kimmich\'s range of passing, tactical intelligence, and leadership in the engine room provide the platform for Wirtz and Musiala to express themselves.' },
    ]
  },
  POR: {
    name: 'Portugal', flag: '🇵🇹', confederation: 'UEFA', probability: 6, fifaRank: 6,
    description: 'Transitioning gracefully beyond the Ronaldo era, Portugal\'s new identity is built around Bruno Fernandes as creative leader and Rafael Leão as the primary attacking threat. Roberto Martínez\'s Portuguese-friendly tactical approach has produced an adaptable, dangerous side capable of beating anyone on a given day. Their squad depth is formidable, and they possess enough quality to go deep into the tournament.',
    players: [
      { name: 'Bruno Fernandes', position: 'Attacking Midfielder / Captain', club: 'Manchester United', description: 'Portugal\'s irreplaceable creative force and captain. Fernandes\'s range of passing, set-piece delivery, and ability to conjure goals from nothing make him the architect of Portugal\'s attacking game.' },
      { name: 'Rafael Leão', position: 'Left Wing / Forward', club: 'AC Milan', description: 'Explosive pace, devastating in 1v1 situations, and deceptively powerful. Leão\'s form at AC Milan has consistently showcased a player who can be unplayable on his day, and he arrives in 2026 seeking his breakthrough World Cup moment.' },
      { name: 'Rúben Neves', position: 'Defensive / Central Midfielder', club: 'Al-Hilal', description: 'The composed, technically excellent midfielder who controls Portugal\'s tempo. Neves\'s long-range shooting, composure under pressure, and reading of the game provide Portugal with a reliable anchor.' },
    ]
  },
  NED: {
    name: 'Netherlands', flag: '🇳🇱', confederation: 'UEFA', probability: 5, fifaRank: 8,
    description: 'Het Elftal reached the Qatar 2022 quarter-finals and are building on that foundation under Ronald Koeman. Combining Van Dijk\'s towering defensive command with Gakpo\'s creative brilliance and Reijnders\'s midfield excellence, the Dutch have developed a balanced, physical side that can grind out results and also play beautiful football.',
    players: [
      { name: 'Virgil van Dijk', position: 'Centre-Back / Captain', club: 'Liverpool', description: 'Arguably the best centre-back of his generation. Van Dijk\'s aerial dominance, composure in possession, and leadership inspire confidence throughout the Dutch defence. Pivotal in Liverpool\'s Premier League and Champions League campaigns.' },
      { name: 'Cody Gakpo', position: 'Left Wing / Second Striker', club: 'Liverpool', description: 'The direct, powerful Dutch winger who lit up Qatar 2022 with three goals. Gakpo\'s physical attributes, technical ability, and directness in attack make him one of Europe\'s most difficult forwards to contain.' },
      { name: 'Tijjani Reijnders', position: 'Central / Attacking Midfielder', club: 'AC Milan', description: 'The elegant, box-to-box midfielder who drives Netherlands forward. Reijnders\'s technical quality and dynamic running have been central to AC Milan\'s recent success, and he brings that form to the national stage.' },
    ]
  },
  BEL: {
    name: 'Belgium', flag: '🇧🇪', confederation: 'UEFA', probability: 3, fifaRank: 3,
    description: 'Belgium\'s golden generation faces one last dance together in North America. Courtois, De Bruyne, and Lukaku have spent over a decade tantalisingly close to winning a major tournament without quite breaking through. This may be their final collective attempt, and the hunger of near-misses could finally translate into the world title that has always evaded them.',
    players: [
      { name: 'Kevin De Bruyne', position: 'Attacking / Central Midfielder', club: 'Manchester City', description: 'Widely regarded as the best midfielder of his generation. De Bruyne\'s passing range, creativity, and ability to score and create in big moments make him the player opponents fear most. This may be his last World Cup.' },
      { name: 'Romelu Lukaku', position: 'Centre-Forward', club: 'AS Roma', description: 'Belgium\'s record goal scorer and the physically imposing spearhead of their attack. Lukaku\'s hold-up play, aerial ability, and finishing make him a constant threat, particularly in transition.' },
      { name: 'Leandro Trossard', position: 'Left Wing / Attacking Midfielder', club: 'Arsenal', description: 'Versatile, technically excellent, and capable of world-class moments. Trossard\'s form at Arsenal has established him as one of Premier League\'s most reliable attackers and a key creative outlet for Belgium.' },
    ]
  },
  COL: {
    name: 'Colombia', flag: '🇨🇴', confederation: 'CONMEBOL', probability: 3, fifaRank: 9,
    description: 'Colombia arrive as arguably the most exciting dark horse in the tournament. Their Copa América 2024 final appearance shocked the continent. Led by James Rodríguez orchestrating from deep and Luis Díaz terrorising defences on the wing, Colombia have the quality to upset the established hierarchy and reach the latter stages.',
    players: [
      { name: 'James Rodríguez', position: 'Attacking Midfielder / CAM', club: 'Rayo Vallecano', description: 'The 2014 World Cup golden boot winner whose career took winding paths but who remains Colombia\'s creative heartbeat. James\'s left foot, vision, and technical quality make him the type of player who wins tournaments when fully motivated.' },
      { name: 'Luis Díaz', position: 'Left Wing / Forward', club: 'Liverpool', description: 'Liverpool\'s electrifying wide forward brings Premier League quality to the Colombian attack. Díaz\'s pace, direct dribbling, and ability to cut inside and finish have been consistently outstanding.' },
      { name: 'Jhon Durán', position: 'Centre-Forward', club: 'Aston Villa', description: 'The powerful young striker who has made an extraordinary impact as a supersub at Aston Villa, scoring crucial goals with seemingly every touch. His physical presence and finishing instinct make him a game-changing threat.' },
    ]
  },
  JPN: {
    name: 'Japan', flag: '🇯🇵', confederation: 'AFC', probability: 2, fifaRank: 18,
    description: 'The Samurai Blue stunned the world in Qatar 2022, beating Germany and Spain in the group stage before only bowing out on penalties. Their technically gifted, intensely organised approach under Hajime Moriyasu has produced the most talented Japanese generation ever. Europe\'s top leagues are now filled with Japanese players, and the 2026 World Cup offers a genuine chance to be the first Asian team to reach the semi-finals.',
    players: [
      { name: 'Kaoru Mitoma', position: 'Left Wing / Forward', club: 'Brighton', description: 'One of the Premier League\'s most unique dribblers. Mitoma\'s low centre of gravity, deceptive pace, and clinical left foot have tormented defenders for Brighton, and he brings that quality to Japan\'s attack.' },
      { name: 'Takefusa Kubo', position: 'Right Wing / Attacking Midfielder', club: 'Real Sociedad', description: 'The highly technical former Barcelona academy product has emerged as one of La Liga\'s most exciting players. Kubo\'s technical quality and creativity in tight spaces make him Japan\'s most skilful performer.' },
      { name: 'Wataru Endo', position: 'Defensive Midfielder', club: 'Liverpool', description: 'Liverpool\'s combative and intelligent holding midfielder provides Japan with a shield in front of the defence. Endo\'s reading of the game, energy, and leadership are what allow Japan\'s technical players to express themselves.' },
    ]
  },
  MAR: {
    name: 'Morocco', flag: '🇲🇦', confederation: 'CAF', probability: 2, fifaRank: 14,
    description: 'Les Lions de l\'Atlas made history as the first African team to reach a World Cup semi-final in Qatar. Their physicality, defensive organisation, and brilliant collective pressing made them the tournament\'s most iconic story. Hakimi leads a team combining African flair with the tactical sophistication of Europe\'s top leagues, and they return determined to go further.',
    players: [
      { name: 'Achraf Hakimi', position: 'Right Back / Wing-Back', club: 'PSG', description: 'The best attacking full-back in world football. Hakimi\'s searing pace, technical quality, and goal threat from right-back have been central to PSG\'s dominance. His performances for Morocco in Qatar were breathtaking.' },
      { name: 'Sofyan Amrabat', position: 'Defensive / Central Midfielder', club: 'Fiorentina', description: 'The warrior of Morocco\'s Qatar 2022 campaign. Amrabat\'s extraordinary intensity, tackling, and technical quality made him arguably the best midfielder in the tournament. He continues to be Morocco\'s defensive cornerstone.' },
      { name: 'Hakim Ziyech', position: 'Right Wing / Attacking Midfielder', club: 'Galatasaray', description: 'The technically brilliant winger with a cultured left foot and exceptional delivery. Ziyech\'s ability to create from wide areas and his stunning free-kick quality give Morocco a set-piece threat at every dead ball.' },
    ]
  },
  CRO: {
    name: 'Croatia', flag: '🇭🇷', confederation: 'UEFA', probability: 2, fifaRank: 11,
    description: 'Croatia\'s extraordinary run to consecutive World Cup finals (2018 silver, 2022 bronze) is testament to their extraordinary collective organisation and individual quality. With Modric still at the helm and the emergence of Gvardiol as a world-class defender, Croatia arrive as dangerous tournament opponents who know exactly how to win knockout football.',
    players: [
      { name: 'Luka Modrić', position: 'Central Midfielder / Captain', club: 'Real Madrid', description: 'The Ballon d\'Or winner and World Cup golden ball recipient whose technical mastery defies age. Modrić\'s vision, range of passing, and ability to control the rhythm of a game continue to define Croatian football, possibly in his final World Cup.' },
      { name: 'Joško Gvardiol', position: 'Centre-Back / Left Back', club: 'Manchester City', description: 'Emerging as one of the best defenders in the world at just 22. Gvardiol\'s pace, composure on the ball, and defensive intelligence have made him central to both Manchester City and Croatia\'s back lines.' },
      { name: 'Mateo Kovačić', position: 'Central Midfielder', club: 'Manchester City', description: 'The industrious, technically excellent midfielder who epitomises Croatian football. Kovačić\'s tireless running, technical quality, and ability to connect defence and attack are invaluable in Croatia\'s compact system.' },
    ]
  },
  CHE: {
    name: 'Switzerland', flag: '🇨🇭', confederation: 'UEFA', probability: 1, fifaRank: 20,
    description: 'The Swiss consistently punch above their weight on the world stage. Built on extraordinary defensive organisation, physical fitness, and quality in key positions, Switzerland have made a habit of reaching knockout stages and causing upsets. Their Euro 2024 quarter-final shows this continues.',
    players: [
      { name: 'Granit Xhaka', position: 'Defensive / Central Midfielder', club: 'Bayer Leverkusen', description: 'The reformed, revitalised captain who has rediscovered his best football at Leverkusen. Xhaka\'s leadership, passing range, and competitive intensity are the foundation of Swiss football.' },
      { name: 'Xherdan Shaqiri', position: 'Right Wing / Attacking Midfielder', club: 'Chicago Fire', description: 'The technically gifted, powerful winger with a thunderous left foot. Despite playing in MLS, Shaqiri\'s international record of decisive moments in tournaments make him a key weapon when Switzerland need a goal.' },
      { name: 'Breel Embolo', position: 'Centre-Forward / Second Striker', club: 'AS Monaco', description: 'Powerful, direct, and technically accomplished. Embolo\'s ability to lead the line physically while contributing to link-up play gives Switzerland an effective focal point in their attack.' },
    ]
  },
  URU: {
    name: 'Uruguay', flag: '🇺🇾', confederation: 'CONMEBOL', probability: 1, fifaRank: 16,
    description: 'La Celeste\'s passion, physical intensity, and collective determination have always made them more than the sum of their parts. Marcelo Bielsa\'s influence has added tactical sophistication to traditional Uruguayan grit. Rodrygo... apologies, Rodrigo Bentancur and Fede Valverde now power a midfield that could dominate any opponent.',
    players: [
      { name: 'Federico Valverde', position: 'Box-to-Box / Central Midfielder', club: 'Real Madrid', description: 'The engine room of one of the world\'s greatest clubs. Valverde\'s physical dominance, technical quality, and goal-scoring ability from midfield make him one of the most complete players in world football, central to both Real Madrid and Uruguay.' },
      { name: 'Darwin Núñez', position: 'Centre-Forward / Left Wing', club: 'Liverpool', description: 'Electric pace, physical power, and a ferocious desire to score. Núñez\'s directness and ability to run in behind defenders at relentless speed make him a constant threat and one of the most feared forwards in Europe.' },
      { name: 'Rodrigo Bentancur', position: 'Central Midfielder', club: 'Tottenham Hotspur', description: 'The elegant, technically polished midfielder who controls tempo and transitions. Bentancur\'s passing accuracy, composure, and intelligence provide Uruguay with a cultured base from which to build.' },
    ]
  },
  USA: {
    name: 'USA', flag: '🇺🇸', confederation: 'CONCACAF', probability: 2, fifaRank: 13,
    description: 'As co-hosts, the United States arrive at their own World Cup with the strongest squad in their history and the passionate backing of over 300 million fans. The Pulisic-Reyna generation has matured in Europe\'s top leagues, and home advantage plus growing tactical sophistication make the USA a genuine knockout threat — particularly in front of packed American stadiums.',
    players: [
      { name: 'Christian Pulisic', position: 'Attacking Midfielder / Right Wing', club: 'AC Milan', description: 'America\'s captain and most complete player. Pulisic\'s Serie A form has been outstanding — scoring and creating prolifically for AC Milan. His directness, two-footedness, and clutch performances in major tournaments make him indispensable.' },
      { name: 'Giovanni Reyna', position: 'Attacking Midfielder / Left Wing', club: 'Borussia Dortmund', description: 'The technically gifted playmaker who has finally found the consistent form his talent always promised. Reyna\'s vision, dribbling, and ability to unlock defences in tight spaces offer the USA a different creative dimension.' },
      { name: 'Yunus Musah', position: 'Central / Right Midfielder', club: 'AC Milan', description: 'The dynamic, energetic midfielder who combines physical intensity with technical quality. Musah\'s ability to win the ball and drive forward makes him a key component in the American pressing game.' },
    ]
  },
  MEX: {
    name: 'Mexico', flag: '🇲🇽', confederation: 'CONCACAF', probability: 1, fifaRank: 15,
    description: 'El Tri face the tantalising prospect of a home World Cup on their own territory. For a nation that has never advanced beyond the quarter-finals, 2026 represents the greatest opportunity in Mexican football history. A new generation of Liga MX and European-based players combine under Javier Aguirre\'s experienced leadership.',
    players: [
      { name: 'Raúl Jiménez', position: 'Centre-Forward', club: 'Fulham', description: 'The experienced spearhead of Mexico\'s attack who brings Premier League quality and big-game temperament. Jiménez\'s hold-up play, aerial ability, and clinical finishing make him a reliable focal point.' },
      { name: 'Edson Álvarez', position: 'Defensive Midfielder', club: 'West Ham / Ajax', description: 'Mexico\'s most important defensive player. Álvarez\'s strength, positioning, and ability to break up play give Mexico the defensive foundation from which to build attacks.' },
      { name: 'Hirving \'Chucky\' Lozano', position: 'Right Wing / Attacking Midfielder', club: 'PSV Eindhoven', description: 'The electric winger whose speed and directness in wide areas have been consistently dangerous for Mexico. Lozano\'s goal against Germany in 2018 remains one of Mexico\'s most iconic moments.' },
    ]
  },
  CAN: {
    name: 'Canada', flag: '🇨🇦', confederation: 'CONCACAF', probability: 1, fifaRank: 48,
    description: 'Canada\'s historic 2022 World Cup qualification ended a 36-year absence from the tournament, and as co-hosts of 2026 they arrive with their most talented squad ever assembled. The Premier League and Bundesliga-quality players throughout the squad — led by Alphonso Davies — have transformed Canadian football expectations entirely.',
    players: [
      { name: 'Alphonso Davies', position: 'Left Back / Left Wing', club: 'Bayern Munich', description: 'One of the most dynamic attacking full-backs on the planet. Davies\'s electric pace — sometimes recorded at 36km/h — extraordinary dribbling, and dangerous deliveries from wide make him Canada\'s most dangerous player and one of the world\'s most exciting performers.' },
      { name: 'Jonathan David', position: 'Centre-Forward', club: 'Lille', description: 'The prolific Ligue 1 striker who scores goals seemingly every time he touches the ball. David\'s movement, composure, and clinical finishing have made him one of Europe\'s most coveted strikers, consistently scoring 20+ league goals per season.' },
      { name: 'Tajon Buchanan', position: 'Right Wing / Full Back', club: 'Inter Milan', description: 'The versatile, athletic Canadian who brings Inter Milan quality to the national team. Buchanan\'s pace and directness in wide areas complement Davies perfectly, giving Canada width on both flanks.' },
    ]
  },
  KOR: {
    name: 'South Korea', flag: '🇰🇷', confederation: 'AFC', probability: 1, fifaRank: 23,
    description: 'The Taeguk Warriors carry the memory of their legendary 2002 semi-final on home soil as inspiration. Modern South Korea, powered by Son Heung-min\'s Premier League excellence and Kim Min-jae\'s defensive dominance in Europe\'s top leagues, combines technical quality with traditional Korean work ethic and intensity.',
    players: [
      { name: 'Son Heung-min', position: 'Left Wing / Second Striker / Captain', club: 'Tottenham Hotspur', description: 'The Premier League\'s beloved South Korean superstar. Son\'s incredible pace, two-footedness, and clinical finishing have made him one of England\'s most consistent performers. His leadership of the national team is irreplaceable.' },
      { name: 'Kim Min-jae', position: 'Centre-Back', club: 'Bayern Munich', description: 'The physically imposing, technically polished centre-back who has become one of Europe\'s best defenders at Bayern Munich. Kim\'s aerial dominance, pace for a defender, and composure provide Korea with a world-class defensive anchor.' },
      { name: 'Lee Kang-in', position: 'Attacking Midfielder / Right Wing', club: 'PSG', description: 'The technically gifted playmaker who has established himself at PSG. Lee\'s creative intelligence, dribbling in tight spaces, and set-piece quality give South Korea a creative hub between Son\'s direct running and the Korean midfield engine.' },
    ]
  },
  IRN: {
    name: 'Iran', flag: '🇮🇷', confederation: 'AFC', probability: 0.5, fifaRank: 22,
    description: 'Team Melli are Asia\'s most experienced World Cup nation, and Carlos Queiroz\'s organisational expertise continues to make them difficult opponents. Built on defensive solidity and quick transitions, Iran are capable of frustrating top sides and punishing mistakes with quality players operating in Europe\'s top leagues.',
    players: [
      { name: 'Mehdi Taremi', position: 'Centre-Forward', club: 'Inter Milan', description: 'Iran\'s inspirational captain and most important player, who made history as the first Iranian to play in the Champions League knockout stages with Porto and now Inter Milan. Taremi\'s physicality, technical quality, and leadership make him Iran\'s most dangerous weapon.' },
      { name: 'Sardar Azmoun', position: 'Centre-Forward / Second Striker', club: 'AS Roma', description: 'Often called the "Iranian Messi", Azmoun\'s technical quality, movement, and finishing ability are well above average for Asian football. His experience at AS Roma brings a different level of tactical sophistication to the Iranian attack.' },
      { name: 'Alireza Jahanbakhsh', position: 'Right Wing / Attacking Midfielder', club: 'Feyenoord', description: 'The technically accomplished winger who has performed consistently in the Eredivisie. Jahanbakhsh\'s dribbling, direct running, and work ethic make him a key component in Iran\'s wide attacking game.' },
    ]
  },
  KSA: {
    name: 'Saudi Arabia', flag: '🇸🇦', confederation: 'AFC', probability: 0.5, fifaRank: 56,
    description: 'Al-Akhdar remain one of Asia\'s most competitive nations despite the controversies surrounding their league\'s investment in global stars. Their 2-1 victory over Argentina in Qatar remains one of the greatest upsets in World Cup history, and the current squad has benefited from playing alongside world-class players in the Saudi Pro League.',
    players: [
      { name: 'Salem Al-Dawsari', position: 'Left Wing / Attacking Midfielder', club: 'Al-Hilal', description: 'The hero of Qatar 2022 who scored the stunning winner against Argentina. Al-Dawsari\'s quick feet, directness, and composure in front of goal make him Saudi Arabia\'s most technically gifted and important attacking player.' },
      { name: 'Firas Al-Buraikan', position: 'Centre-Forward', club: 'Al-Hilal', description: 'Saudi Arabia\'s prolific young striker whose pace and predatory instincts have made him a consistent scorer at club level. Al-Buraikan\'s directness and movement in behind opposing defences provide a constant threat.' },
      { name: 'Mohammed Kanno', position: 'Defensive / Central Midfielder', club: 'Al-Hilal', description: 'The combative and technical midfielder who provides defensive stability and distribution quality in the middle of the park. Kanno\'s engine and experience are essential to Saudi Arabia\'s balanced approach.' },
    ]
  },
  AUS: {
    name: 'Australia', flag: '🇦🇺', confederation: 'AFC', probability: 0.5, fifaRank: 25,
    description: 'The Socceroos\' Qatar 2022 run to the round of 16 — beating Denmark and pushing Argentina close — showed a team with quality beyond expectations. Under Graham Arnold, Australia combine European-quality individual players with relentless collective pressing and a physical approach that makes them dangerous to any opponent.',
    players: [
      { name: 'Mathew Leckie', position: 'Right Wing / Forward', club: 'Melbourne City', description: 'The veteran captain whose extra-time winner against Denmark in 2022 remains one of Australian football\'s greatest moments. Leckie\'s pace, directness, and big-game mentality exemplify what makes Australia hard to beat.' },
      { name: 'Ajdin Hrustic', position: 'Attacking / Central Midfielder', club: 'Real Betis', description: 'The elegant playmaker with an excellent left foot who provides Australia\'s most creative midfield threat. Hrustic\'s ability to play through pressure and create in tight spaces gives Australia a quality passer in central areas.' },
      { name: 'Mat Ryan', position: 'Goalkeeper', club: 'AZ Alkmaar', description: 'Australia\'s experienced and reliable goalkeeper who has been a consistent performer in European football for over a decade. Ryan\'s composure under pressure and handling quality provide the Socceroos with a dependable last line of defence.' },
    ]
  },
  SEN: {
    name: 'Senegal', flag: '🇸🇳', confederation: 'CAF', probability: 1, fifaRank: 19,
    description: 'The reigning African champions bring formidable athleticism, technical quality, and collective organisation to the 2026 World Cup. Led by Sadio Mané and energised by a new generation of Premier League and French league players, Senegal are one of Africa\'s best chances to replicate Morocco\'s 2022 semi-final achievement.',
    players: [
      { name: 'Sadio Mané', position: 'Forward / Left Wing', club: 'Al-Nassr', description: 'Africa\'s greatest player of his generation. Despite his move to Saudi Arabia, Mané remains at the top of his game and carries the hopes of Senegal. His pace, physicality, and scoring instinct make him a genuine world-class threat.' },
      { name: 'Cheikhou Kouyaté', position: 'Central Midfielder / Defensive Midfielder', club: 'Nottingham Forest', description: 'The experienced, powerful midfielder who provides Senegal with physical presence and leadership in the engine room. Kouyaté\'s energy and commitment set the tone for Senegal\'s high-intensity pressing game.' },
      { name: 'Ismaïla Sarr', position: 'Right Wing / Forward', club: 'Crystal Palace', description: 'The electric Premier League winger who combines blistering pace with improving technical quality. Sarr\'s direct running, goal threat, and crossing ability give Senegal a dangerous right-side attack.' },
    ]
  },
  EGY: {
    name: 'Egypt', flag: '🇪🇬', confederation: 'CAF', probability: 0.5, fifaRank: 34,
    description: 'Egypt\'s World Cup aspirations are synonymous with Mohamed Salah, whose career has reached the summit of world football with Liverpool. The Pharaohs have built a team worthy of their talisman, with defensive stability and clinical counter-attacking football giving them the platform to cause upsets.',
    players: [
      { name: 'Mohamed Salah', position: 'Right Wing / Second Striker', club: 'Liverpool', description: 'Liverpool\'s all-time record scorer and one of the best players in Premier League history. Salah\'s directness, clinical finishing, and goal-scoring consistency are extraordinary. His scoring records speak for themselves — he remains world-class at 33.' },
      { name: 'Omar Marmoush', position: 'Forward / Attacking Midfielder', club: 'Manchester City', description: 'The explosive Egyptian forward who has become one of the Bundesliga and Premier League\'s most prolific attackers. Marmoush\'s pace, directness, and clinical finishing have established him as a natural successor to lead Egypt\'s attack alongside Salah.' },
      { name: 'Mahmoud Trezeguet', position: 'Left Wing / Attacking Midfielder', club: 'Trabzonspor', description: 'The technical left winger with Euro 2020 final-winning experience for Egypt\'s AFCON campaigns. Trezeguet\'s intelligence, set-piece delivery, and creative contributions complement Salah\'s direct approach.' },
    ]
  },
  GHA: {
    name: 'Ghana', flag: '🇬🇭', confederation: 'CAF', probability: 0.5, fifaRank: 66,
    description: 'The Black Stars have World Cup history — they came agonisingly close to becoming the first African team in a semi-final in 2010. A new generation combining European-based talent with the Ayew brothers\' experience brings renewed ambition. Ghana\'s technical quality and physical attributes can trouble any team on a good day.',
    players: [
      { name: 'Mohammed Kudus', position: 'Attacking Midfielder / Right Wing', club: 'West Ham', description: 'One of the most exciting young African players in European football. Kudus\'s dribbling, creativity, and ability to score from wide areas or deep positions have been outstanding at West Ham. His unpredictability and technical quality make him a major threat.' },
      { name: 'Jordan Ayew', position: 'Forward / Second Striker', club: 'Al-Qadsiah', description: 'The experienced forward and elder of the famous Ayew footballing family who provides Ghana with composure and know-how up front. Ayew\'s link play, work rate, and experience are invaluable for Ghana\'s organised attacks.' },
      { name: 'Antoine Semenyo', position: 'Right Wing / Forward', club: 'Bournemouth', description: 'The powerful, direct Premier League winger who combines physical pace with technical quality. Semenyo\'s ability to run at defenders and create danger from wide positions gives Ghana an explosive outlet in attack.' },
    ]
  },
  ALG: {
    name: 'Algeria', flag: '🇩🇿', confederation: 'CAF', probability: 0.5, fifaRank: 42,
    description: 'The Desert Foxes, armed with players born and raised in France, consistently prove they are more than a sum of their parts. Their 2019 AFCON triumph and Riyad Mahrez\'s enduring quality give Algeria both a winning pedigree and a world-class player to build around.',
    players: [
      { name: 'Riyad Mahrez', position: 'Right Wing / Attacking Midfielder', club: 'Al-Ahli', description: 'The mercurial, technically brilliant winger who won Premier League and Champions League titles with Manchester City. Mahrez\'s dribbling, creativity, and goal threat remain elite even in Saudi Arabia, and for Algeria he is irreplaceable.' },
      { name: 'Ismaël Bennacer', position: 'Central / Defensive Midfielder', club: 'AC Milan', description: 'The technically refined, combative midfielder who has been one of Serie A\'s most reliable performers at AC Milan. Bennacer\'s ability to win the ball and circulate it quickly gives Algeria controlled possession.' },
      { name: 'Youcef Atal', position: 'Right Back / Right Wing', club: 'Nice', description: 'The marauding full-back who provides constant attacking threat from right back. Atal\'s quality in possession, delivery, and ability to combine with Mahrez make Algeria\'s right side particularly dangerous.' },
    ]
  },
  RSA: {
    name: 'South Africa', flag: '🇿🇦', confederation: 'CAF', probability: 0.3, fifaRank: 65,
    description: 'Bafana Bafana, the 2023 AFCON bronze medalists, return to the World Cup stage with renewed confidence. A new generation of well-organised, technically improving players under Hugo Broos has transformed South African football\'s consistency.',
    players: [
      { name: 'Percy Tau', position: 'Left Wing / Attacking Midfielder', club: 'Al-Ahly', description: 'South Africa\'s most technically gifted player, whose years in Europe and now with Africa\'s most successful club have refined his game. Tau\'s dribbling, intelligence, and goal threat make him South Africa\'s most important attacking player.' },
      { name: 'Themba Zwane', position: 'Attacking Midfielder / Left Wing', club: 'Mamelodi Sundowns', description: 'The best player in the African Champions League who has been consistently dominant in South African football. Zwane\'s creative intelligence and technical quality make him Bafana\'s key creative outlet.' },
      { name: 'Ronwen Williams', position: 'Goalkeeper', club: 'Mamelodi Sundowns', description: 'Named AFCON 2023\'s best goalkeeper after a series of outstanding performances including crucial saves in the penalty shootout victory. Williams\'s consistency and shot-stopping ability are South Africa\'s most reliable asset.' },
    ]
  },
  COD: {
    name: 'DR Congo', flag: '🇨🇩', confederation: 'CAF', probability: 0.3, fifaRank: 71,
    description: 'Les Léopards have historically been African football giants, and a new generation of French and Belgian-based players is reigniting that tradition. Their return to the World Cup stage comes with legitimate ambition to reach the knockout rounds.',
    players: [
      { name: 'Cédric Bakambu', position: 'Centre-Forward', club: 'Olympique de Marseille', description: 'The experienced, technically gifted striker who has performed at the highest level in La Liga and Ligue 1. Bakambu\'s intelligence, finishing quality, and ability to link play make him DR Congo\'s most dangerous attacker.' },
      { name: 'Arthur Masuaku', position: 'Left Back / Left Wing', club: 'Beşiktaş', description: 'The athletic, marauding left back who provides DR Congo with consistent attacking threat from wide areas. Masuaku\'s energy and delivery from the left create danger and width.' },
      { name: 'Dodi Lukébakio', position: 'Right Wing / Attacking Midfielder', club: 'Sevilla', description: 'The powerful, direct winger with a powerful shot and ability to run at defenders. Lukébakio\'s performances in La Liga have shown he can compete at the highest level with physical and technical qualities.' },
    ]
  },
  ECU: {
    name: 'Ecuador', flag: '🇪🇨', confederation: 'CONMEBOL', probability: 0.5, fifaRank: 35,
    description: 'La Tri opened the 2022 World Cup with a stunning win against hosts Qatar and showed they belong on the world stage. Built on a solid defensive foundation and the creativity of Moisés Caicedo — one of Europe\'s most coveted midfielders — Ecuador arrive in 2026 with enhanced ambitions.',
    players: [
      { name: 'Moisés Caicedo', position: 'Defensive / Central Midfielder', club: 'Chelsea', description: 'One of the most sought-after defensive midfielders in world football, commanding a Chelsea record fee. Caicedo\'s physical dominance, technical quality, and ability to drive forward with the ball make him Ecuador\'s most important player.' },
      { name: 'Enner Valencia', position: 'Centre-Forward / Second Striker', club: 'Fenerbahçe', description: 'Ecuador\'s all-time World Cup top scorer whose powerful physique, intelligent movement, and clinical finishing have made him a consistent performer at the highest level despite his years. His leadership and experience are priceless.' },
      { name: 'Gonzalo Plata', position: 'Right Wing / Forward', club: 'Al-Qadsiah', description: 'The direct, quick winger who brings pace and technical quality to Ecuador\'s right flank. Plata\'s ability to beat defenders and deliver into dangerous areas provides Ecuador with consistent attacking width.' },
    ]
  },
  SCO: {
    name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', confederation: 'UEFA', probability: 0.3, fifaRank: 37,
    description: 'Scotland\'s World Cup return ends a 28-year absence that has haunted the nation. Under Steve Clarke, Scotland have developed into a competitive, well-organised side with Premier League quality throughout. Robertson\'s leadership, McTominay\'s goals from midfield, and collective defensive organisation make them a potential surprise package.',
    players: [
      { name: 'Andrew Robertson', position: 'Left Back / Captain', club: 'Liverpool', description: 'Liverpool\'s legendary left back and Scotland\'s inspirational captain. Robertson\'s energy, crossing quality, and leadership are exceptional. His Liverpool experience and winners\' mentality are essential to Scotland\'s belief.' },
      { name: 'Scott McTominay', position: 'Central Midfielder / Box-to-Box', club: 'Napoli', description: 'Transformed into an attacking midfielder sensation at Napoli after his Scotland heroics, McTominay\'s goals from deep, physical presence, and incredible technique make him Scotland\'s match-winner in key moments.' },
      { name: 'John McGinn', position: 'Central Midfielder', club: 'Aston Villa', description: 'Scotland\'s most energetic and consistent performer over many years. McGinn\'s intensity, technical quality, and goal threat from midfield make him the engine of Scotland\'s pressing system.' },
    ]
  },
  AUT: {
    name: 'Austria', flag: '🇦🇹', confederation: 'UEFA', probability: 0.5, fifaRank: 27,
    description: 'Austria have developed a consistent, technically impressive side that reached the Euro 2024 round of 16. Under Ralf Rangnick\'s pressing-intensive philosophy, Austria are extremely difficult to play against and have quality throughout. Sabitzer and Baumgartner lead a generation that could genuinely surprise in North America.',
    players: [
      { name: 'Marcel Sabitzer', position: 'Central / Attacking Midfielder', club: 'Borussia Dortmund', description: 'Austria\'s most important creative player who contributes goals, assists, and defensive work in equal measure. Sabitzer\'s technical quality, energy, and experience at the highest level make him Austria\'s heartbeat.' },
      { name: 'Christoph Baumgartner', position: 'Attacking Midfielder / Second Striker', club: 'RB Leipzig', description: 'The creative Bundesliga attacking midfielder who provides Austria with clever movement and goal contribution around the penalty area. Baumgartner\'s intelligence and technical quality between the lines are Austria\'s creative spark.' },
      { name: 'Marko Arnautovic', position: 'Centre-Forward', club: 'Inter Milan', description: 'The powerfully built, technically gifted and highly motivated striker who divides opinion but delivers for Austria when it matters. Arnautovic\'s hold-up play, physical presence, and big-game performances at Inter Milan give Austria a proven focal point.' },
    ]
  },
  TUR: {
    name: 'Türkiye', flag: '🇹🇷', confederation: 'UEFA', probability: 1, fifaRank: 26,
    description: 'Türkiye\'s spectacular performances at Euro 2024 — reaching the quarter-finals with some outstanding football — announced their arrival as a genuine European force. Under Vincenzo Montella, they have a system that maximises the extraordinary talent of Arda Güler and Çalhanoğlu. A potential dark horse in North America.',
    players: [
      { name: 'Hakan Çalhanoğlu', position: 'Defensive / Central Midfielder', club: 'Inter Milan', description: 'One of Serie A\'s finest midfielders who has undergone an extraordinary tactical evolution from attacking player to world-class regista. Çalhanoğlu\'s passing range, set-piece delivery, and leadership make him Türkiye\'s most important player.' },
      { name: 'Arda Güler', position: 'Attacking Midfielder / Right Wing', club: 'Real Madrid', description: 'Described as a generational talent, Güler\'s technical quality drew comparisons to Mesut Özil at the same age. His vision, dribbling, and composure for Real Madrid and Türkiye have already produced extraordinary moments for someone so young.' },
      { name: 'Kerem Aktürkoğlu', position: 'Left Wing / Forward', club: 'Galatasaray', description: 'The explosive, direct winger who has been one of Galatasaray\'s most impactful players in European football. Aktürkoğlu\'s pace, directness, and goal threat from wide areas give Türkiye consistent danger on the left side.' },
    ]
  },
  PAN: {
    name: 'Panama', flag: '🇵🇦', confederation: 'CONCACAF', probability: 0.2, fifaRank: 55,
    description: 'Los Canaleros have established themselves as one of CONCACAF\'s most competitive nations. Their physical, organised approach under Thomas Christiansen gives them defensive solidity that makes them difficult to beat, and they are capable of causing upsets against stronger sides with a compact defensive shape.',
    players: [
      { name: 'Rodolfo Pitti', position: 'Centre-Forward', club: 'Elche', description: 'Panama\'s most dynamic and prolific attacker whose pace and physicality in European football give Los Canaleros a direct threat in transition. Pitti\'s ability to hold the ball and bring others into play is essential to Panama\'s attack.' },
      { name: 'César Blackman', position: 'Defensive Midfielder', club: 'Godoy Cruz', description: 'The energetic and competitive midfielder whose physical presence and defensive work rate give Panama the base to defend deep and hit teams on the counter. His engine makes Panama difficult to play through.' },
      { name: 'Aníbal Godoy', position: 'Defensive Midfielder / Centre-Back', club: 'Nashville SC', description: 'Panama\'s highly experienced defensive anchor who has been instrumental in their qualification campaigns. Godoy\'s leadership, physical intensity, and defensive intelligence provide the backbone of Panama\'s disciplined system.' },
    ]
  },
  QAT: {
    name: 'Qatar', flag: '🇶🇦', confederation: 'AFC', probability: 0.2, fifaRank: 37,
    description: 'The 2022 hosts faced a brutal group stage but have developed considerably since. The investment in technical development through the Aspire Academy has produced genuinely talented local players, and Almoez Ali leads a team with more quality than their last World Cup campaign suggested.',
    players: [
      { name: 'Almoez Ali', position: 'Centre-Forward', club: 'Al-Duhail', description: 'Qatar\'s all-time international top scorer and their most technically gifted attacker. Ali\'s movement, technical quality, and ability to score from multiple situations give Qatar an effective focal point around which their attacks are built.' },
      { name: 'Hassan Al-Haydos', position: 'Right Wing / Attacking Midfielder', club: 'Al-Sadd', description: 'Qatar\'s experienced captain and creative hub who has been a consistent performer in Qatari football for over a decade. Al-Haydos\'s technical quality and vision provide Qatar with their best passing and creative outlet in attack.' },
      { name: 'Akram Afif', position: 'Left Wing / Attacking Midfielder', club: 'Al-Sadd', description: 'Qatar\'s most creative and technically accomplished attacker, whose dribbling ability and creativity have been central to Qatar\'s recent Asian Cup success. Afif\'s composure and technical quality give Qatar their best chance of scoring against top opposition.' },
    ]
  },
  JOR: {
    name: 'Jordan', flag: '🇯🇴', confederation: 'AFC', probability: 0.2, fifaRank: 68,
    description: 'Jordan\'s remarkable Asian Cup 2024 final appearance was the breakthrough moment for a nation that has worked systematically to improve its football infrastructure. Under Hussain Ammouta, they combine defensive organisation with smart counter-attacking to compete above their theoretical level.',
    players: [
      { name: 'Musa Al-Taamari', position: 'Right Wing / Attacking Midfielder', club: 'Montpellier', description: 'Jordan\'s most technically gifted player who has established himself in Ligue 1. Al-Taamari\'s creative intelligence, dribbling ability, and goal threat make him the player opponents most fear, and he leads Jordan\'s attacks.' },
      { name: 'Yazan Al-Naimat', position: 'Centre-Forward', club: 'Al-Faysali', description: 'Jordan\'s prolific international striker whose positioning and finishing have been central to their Asian Cup success. Al-Naimat\'s intelligent movement and composure in front of goal give Jordan a reliable goal threat.' },
      { name: 'Baha\' Faisal', position: 'Left Back / Defensive Midfielder', club: 'Al-Faysali', description: 'The energetic and combative left-sided player who provides Jordan with defensive solidity and attacking contribution. His work ethic and physical qualities are essential to Jordan\'s compact, organised defensive shape.' },
    ]
  },
  IRQ: {
    name: 'Iraq', flag: '🇮🇶', confederation: 'AFC', probability: 0.2, fifaRank: 72,
    description: 'Iraq\'s remarkable qualification and Asian Cup bronze medal represents a footballing renaissance for a nation with historic ambitions in Asian football. The Mesopotamia Lions have developed collectively and are more organised and technically capable than their ranking suggests.',
    players: [
      { name: 'Mohanad Ali', position: 'Centre-Forward', club: 'Air Force Club', description: 'Iraq\'s most prolific attacker whose goal-scoring for club and country has been outstanding. Mohanad\'s physical presence, intelligent movement, and finishing quality make him the focal point around whom Iraq\'s attacks are organised.' },
      { name: 'Amjad Attwan', position: 'Right Wing / Attacking Midfielder', club: 'Al-Zawraa', description: 'Iraq\'s creative winger who combines technical quality with pace and directness. Attwan\'s ability to take on defenders and deliver in dangerous situations gives Iraq their best creative outlet from wide areas.' },
      { name: 'Aymen Hussein', position: 'Defensive / Central Midfielder', club: 'Al-Zawraa', description: 'The experienced, combative midfielder who has been the defensive cornerstone of Iraq\'s recent successes. Hussein\'s leadership, physical quality, and ability to protect the defence are essential to Iraq\'s competitive organisation.' },
    ]
  },
  NZL: {
    name: 'New Zealand', flag: '🇳🇿', confederation: 'OFC', probability: 0.1, fifaRank: 93,
    description: 'The All Whites punch well above their weight for a nation of five million people. They are disciplined, well-organised, and capable of competing physically with much stronger nations. This may be their last World Cup as a Pacific representative before Oceania increases its allocation.',
    players: [
      { name: 'Chris Wood', position: 'Centre-Forward', club: 'Nottingham Forest', description: 'New Zealand\'s most accomplished professional player and all-time top scorer. Wood\'s Premier League experience, aerial ability, and physical presence make him a formidable target man who gives New Zealand a reliable goal-scoring foundation.' },
      { name: 'Clayton Lewis', position: 'Central Midfielder', club: 'Seattle Sounders', description: 'The technically composed central midfielder who anchors New Zealand\'s build-up play. Lewis\'s distribution, reading of the game, and work ethic give New Zealand a reliable platform to operate from in central areas.' },
      { name: 'Liberato Cacace', position: 'Left Back / Left Wing', club: 'Empoli', description: 'The Serie A-based attacking full-back who provides New Zealand with European quality and dynamic width on the left side. Cacace\'s technical ability and attacking quality are well above average for the OFC.' },
    ]
  },
  CZE: {
    name: 'Czech Republic', flag: '🇨🇿', confederation: 'UEFA', probability: 0.5, fifaRank: 37,
    description: 'Czech Republic qualified through the UEFA playoffs, defeating Italy on penalties in a dramatic final. Built around the powerful Sparta Prague and Slavia Prague domestic core alongside Premier League stars, the Czechs bring resilient technical quality. Led by one of Europe\'s most clinical strikers, they are here to prove a point.',
    players: [
      { name: 'Patrik Schick', position: 'Centre-Forward', club: 'Bayer Leverkusen', description: 'One of the Bundesliga\'s most lethal finishers. Schick\'s clinical left foot, aerial ability, and composure in the box make him the centrepiece of Czech attacking play. His long-range Euro 2020 goal against Scotland is already iconic.' },
      { name: 'Tomáš Souček', position: 'Central Midfielder', club: 'West Ham United', description: 'A Premier League powerhouse who combines extraordinary aerial ability with technical quality and an underrated goal threat. Souček\'s box-to-box energy and leadership are the foundation of the Czech midfield.' },
      { name: 'Vladimír Coufal', position: 'Right Back', club: 'West Ham United', description: 'One of the most reliable and dynamic right backs in the Premier League. Coufal\'s defensive solidity, overlapping runs, and delivery from wide areas provide Czech Republic with consistent quality on the right flank.' },
    ]
  },
  BIH: {
    name: 'Bosnia and Herzegovina', flag: '🇧🇦', confederation: 'UEFA', probability: 0.3, fifaRank: 62,
    description: 'Bosnia and Herzegovina return to the World Cup stage for just the second time in their history, having previously appeared in Brazil 2014. Their playoff qualification run was emotional and richly deserved. The Dragons are powered by prolific European-based strikers and a passionate fanbase.',
    players: [
      { name: 'Ermedin Demirović', position: 'Centre-Forward', club: 'Stuttgart', description: 'One of the Bundesliga\'s most consistent scorers. Demirović\'s relentless pressing, intelligent movement, and clinical finishing have made him one of European football\'s most sought-after strikers. He is the focal point of everything Bosnia do offensively.' },
      { name: 'Edin Džeko', position: 'Centre-Forward', club: 'Fenerbahçe', description: 'Bosnia\'s all-time leading scorer and legendary captain. Even in the latter stages of his career, Džeko\'s football intelligence, technical quality, and leadership give Bosnia immeasurable experience and goals from the bench or when called upon.' },
      { name: 'Amer Gojak', position: 'Central Midfielder', club: 'Trabzonspor', description: 'An energetic and technically gifted midfielder whose range of passing and pressing intensity help Bosnia control games in the middle third. Gojak\'s ability to link defence and attack fluidly is central to Bosnia\'s structure.' },
    ]
  },
  HAI: {
    name: 'Haiti', flag: '🇭🇹', confederation: 'CONCACAF', probability: 0.2, fifaRank: 83,
    description: 'Haiti qualify for their second-ever World Cup, having first appeared in 1974. In a competitive CONCACAF qualifying campaign the Grenadiers emerged as a genuine surprise package. Known for vibrant attacking play, resilient defending, and passionate supporters, Haiti arrive on the world stage with nothing to lose.',
    players: [
      { name: 'Frantzdy Pierrot', position: 'Centre-Forward', club: 'CD Santa Clara', description: 'Haiti\'s most clinical finisher and national team top scorer. Pierrot\'s combination of physicality, intelligent movement, and finishing ability make him the focal point of Haiti\'s attack and their greatest goal threat.' },
      { name: 'Duckens Nazon', position: 'Right Wing / Forward', club: 'UNAM Pumas', description: 'An explosive and direct winger who gives Haiti an outlet on the break. Nazon\'s pace and directness make him difficult to track at full speed, and his ability to stretch defences creates space for team-mates.' },
      { name: 'Romario Williams', position: 'Striker / Right Wing', club: 'FC Dallas', description: 'A powerful and industrious forward whose combination of work rate and finishing ability in MLS has translated into consistent international performances. Williams brings energy, pressing and goals to Haiti\'s forward line.' },
    ]
  },
  PAR: {
    name: 'Paraguay', flag: '🇵🇾', confederation: 'CONMEBOL', probability: 0.6, fifaRank: 54,
    description: 'Paraguay return to the World Cup for the first time since 2010, ending a sixteen-year absence through sheer resilience in South America\'s gruelling qualifying campaign. The Albirroja are led by a new generation of Premier League stars determined to match the quarter-final heroics of previous Paraguayan generations.',
    players: [
      { name: 'Miguel Almirón', position: 'Attacking Midfielder / Forward', club: 'Newcastle United', description: 'The Premier League fan favourite whose relentless energy, technical quality, and direct running make him one of the most exciting players in Paraguay\'s history. Almirón\'s ability to combine tireless pressing with goals and assists is his trademark.' },
      { name: 'Julio Enciso', position: 'Forward / Attacking Midfielder', club: 'Brighton & Hove Albion', description: 'An electrifying young forward with the ability to score spectacular goals and make things happen from nothing. Enciso\'s unpredictability, creativity, and explosive pace make him one of South America\'s most exciting young talents.' },
      { name: 'Gustavo Gómez', position: 'Centre-Back', club: 'Palmeiras', description: 'Paraguay\'s commanding and experienced captain. Gómez\'s aerial dominance, composed reading of the game, and leadership at the back of a South American champion club have made him the defensive bedrock around which Paraguay\'s qualifying success was built.' },
    ]
  },
  CUW: {
    name: 'Curaçao', flag: '🇨🇼', confederation: 'CONCACAF', probability: 0.1, fifaRank: 78,
    description: 'Making their historic first-ever World Cup appearance, Curaçao is 2026\'s most extraordinary new entrant. The tiny Dutch Caribbean island — population just 150,000 — has punched spectacularly above its weight in CONCACAF, aided by Dutch football connections and a growing pool of European-based players. An unforgettable debut.',
    players: [
      { name: 'Leandro Bacuna', position: 'Midfielder / Right Back', club: 'Reading', description: 'The Dutch-born veteran who has been the cornerstone of Curaçao\'s rise for over a decade. Bacuna\'s experience in English football, versatility across midfield and defence, and leadership set the standard for this historic qualifying squad.' },
      { name: 'Juninho Bacuna', position: 'Central Midfielder', club: 'Birmingham City', description: 'Leandro\'s younger brother and a technically gifted central midfielder who has established himself in the Championship. Juninho\'s energy, passing range, and direct running give Curaçao quality in the engine room.' },
      { name: 'Gevaro Nepomuceno', position: 'Left Wing / Attacking Midfielder', club: 'Various', description: 'One of Curaçao\'s most technically gifted players whose creativity and flair in wide areas give the team an unpredictable attacking outlet. Nepomuceno\'s ability to beat defenders and create chances has been central to their CONCACAF success.' },
    ]
  },
  CIV: {
    name: 'Ivory Coast', flag: '🇨🇮', confederation: 'CAF', probability: 1.5, fifaRank: 44,
    description: 'The Elephants arrive fresh from their triumphant Africa Cup of Nations title on home soil, making them the most in-form African side in the tournament. Backed by outstanding talent across Europe\'s top leagues, Ivory Coast combine physical power with genuine technical quality. They are a realistic dark horse for the knockout stages.',
    players: [
      { name: 'Sébastien Haller', position: 'Centre-Forward', club: 'Borussia Dortmund', description: 'A towering target forward who survived a life-threatening illness to return as one of the Bundesliga\'s most effective strikers. Haller\'s aerial dominance, link-up play, and composure in the box make him the perfect focal point for Ivory Coast\'s attack.' },
      { name: 'Franck Kessié', position: 'Central Midfielder', club: 'Al-Ahli', description: 'A Champions League winner and Premier League player with Barcelona in between, Kessié\'s physicality, stamina, and technical quality make him one of the most complete midfielders in African football. His engine and goals from deep are irreplaceable.' },
      { name: 'Simon Adingra', position: 'Left Wing / Forward', club: 'Brighton & Hove Albion', description: 'The AFCON hero whose goals helped Ivory Coast to continental glory on home soil. Adingra\'s explosive pace, directness, and clinical finishing have made him one of the Premier League\'s most exciting young wide forwards and Ivory Coast\'s brightest new star.' },
    ]
  },
  SWE: {
    name: 'Sweden', flag: '🇸🇪', confederation: 'UEFA', probability: 1.0, fifaRank: 26,
    description: 'Sweden return to the World Cup stage after missing out in 2022, re-energised by a new generation led by two of the Premier League\'s most lethal strikers. The Vikings\' characteristic tactical discipline and pressing intensity, combined with extraordinary individual quality up front, make them a genuine threat to any opposition.',
    players: [
      { name: 'Viktor Gyökeres', position: 'Centre-Forward', club: 'Arsenal', description: 'One of the most prolific strikers in European football, having shattered records at Sporting CP before moving to Arsenal. Gyökeres\'s physical power, relentless pressing, technical quality, and extraordinary goal-scoring consistency make him one of the most feared strikers at this tournament.' },
      { name: 'Alexander Isak', position: 'Centre-Forward / Second Striker', club: 'Newcastle United', description: 'An elegant, quick and increasingly prolific striker who has become one of the Premier League\'s finest attackers. Isak\'s movement, technical quality, and composure in front of goal give Sweden a fluid, intelligent alternative to Gyökeres\'s physicality.' },
      { name: 'Dejan Kulusevski', position: 'Right Wing / Attacking Midfielder', club: 'Tottenham Hotspur', description: 'A dynamic, technically brilliant wide player who has been one of Tottenham\'s most consistent performers. Kulusevski\'s directness, creativity, and ability to score and assist in equal measure give Sweden a creative spark that connects their midfield with their world-class strikers.' },
    ]
  },
  TUN: {
    name: 'Tunisia', flag: '🇹🇳', confederation: 'CAF', probability: 0.5, fifaRank: 34,
    description: 'Tunisia are one of Africa\'s most consistent World Cup nations, appearing at their seventh edition. The Eagles of Carthage combine technical Mediterranean football with excellent defensive organisation. Known for their competitive resilience — including a famous win over France in Qatar 2022 — they are capable of upsetting stronger opponents.',
    players: [
      { name: 'Hannibal Mejbri', position: 'Central / Attacking Midfielder', club: 'Burnley', description: 'The technically gifted young midfielder who developed at Manchester United and has become the creative heart of Tunisia\'s attack. Hannibal\'s vision, dribbling, and ability to find pockets of space make him Tunisia\'s most dangerous creative presence.' },
      { name: 'Wahbi Khazri', position: 'Attacking Midfielder / Second Striker', club: 'Al-Ittihad', description: 'The experienced playmaker and Tunisia\'s most creative player of the past decade. Khazri\'s technical quality, goal-scoring instinct, and ability to unlock defences with clever movement and passing make him a constant threat when in form.' },
      { name: 'Mohamed Drager', position: 'Right Back / Wing-Back', club: 'FC Copenhagen', description: 'A dynamic and combative right back who contributes offensively with intelligent overlapping runs and consistent deliveries. Drager\'s defensive solidity combined with his attacking contribution make him one of the most complete backs in African football.' },
    ]
  },
  NOR: {
    name: 'Norway', flag: '🇳🇴', confederation: 'UEFA', probability: 2.5, fifaRank: 28,
    description: 'Norway arrive at their first World Cup since 2002 with arguably the most feared striker on the planet. Erling Haaland\'s presence alone transforms this team into genuine dark horses with the ability to go deep into the knockout stages. If the team around him fires, Norway could be the biggest story of the 2026 World Cup.',
    players: [
      { name: 'Erling Haaland', position: 'Centre-Forward', club: 'Manchester City', description: 'The most prolific striker in the world and arguably in football history by goals per game. Haaland\'s combination of extraordinary physical power, speed, movement, and clinical finishing is essentially unplayable on his best days. One man who can win Norway a tournament.' },
      { name: 'Martin Ødegaard', position: 'Attacking Midfielder / CAM', club: 'Arsenal', description: 'Arsenal\'s captain and one of the Premier League\'s finest playmakers. Ødegaard\'s vision, technical quality, and ability to create chances from the half-space make him the perfect partner for Haaland — delivering the service the striker needs to devastate defences.' },
      { name: 'Sander Berge', position: 'Central / Defensive Midfielder', club: 'Fulham', description: 'A powerful, technically gifted midfielder who has established himself as one of the Premier League\'s best. Berge\'s imposing physical presence, range of passing, and ability to win the ball and drive forward give Norway a genuine all-round midfielder to anchor their engine room.' },
    ]
  },
  UZB: {
    name: 'Uzbekistan', flag: '🇺🇿', confederation: 'AFC', probability: 0.3, fifaRank: 68,
    description: 'Uzbekistan make their first-ever FIFA World Cup appearance, capping a remarkable rise through investment in youth development and coaching. The White Wolves stunned the AFC qualifying campaign and opened a new chapter in Central Asian football. They arrive with nothing to lose and a young squad eager to make their historic mark.',
    players: [
      { name: 'Eldor Shomurodov', position: 'Centre-Forward / Second Striker', club: 'Roma', description: 'Uzbekistan\'s most famous export and the player who put Central Asian football on the map. Shomurodov\'s intelligent movement, technical quality, and goal-scoring ability at Roma give Uzbekistan a genuine Serie A-proven striker to lead their historic campaign.' },
      { name: 'Jaloliddin Masharipov', position: 'Attacking Midfielder / Winger', club: 'Pakhtakor', description: 'A technically gifted and quick attacker who has been the creative hub of Uzbek football for years. Masharipov\'s dribbling, vision, and ability to unlock defences in tight spaces make him the player most likely to create something special for Uzbekistan.' },
      { name: 'Abbosbek Fayzullaev', position: 'Left Wing / Attacking Midfielder', club: 'CSKA Moscow', description: 'A dynamic young winger whose pace, directness, and technical quality have attracted attention across European football. Fayzullaev\'s energy and ability to beat defenders on the left side give Uzbekistan a fast, direct outlet going forward.' },
    ]
  },
  CPV: {
    name: 'Cape Verde', flag: '🇨🇻', confederation: 'CAF', probability: 0.2, fifaRank: 75,
    description: 'The Blue Sharks of Cape Verde continue to punch spectacularly above their weight for a nation of just 500,000 people. Having qualified for multiple Africa Cup of Nations tournaments and won the CAF qualifying group outright, they made the World Cup leap on merit. Most players are Portugal-based, giving them a technical quality that belies their ranking.',
    players: [
      { name: 'Ryan Mendes', position: 'Left Wing / Forward', club: 'Vitória de Guimarães', description: 'Cape Verde\'s most experienced attacking player whose technical quality and creativity on the left flank have been central to the Blue Sharks\' success. Mendes\'s ability to cut inside, deliver, and score gives Cape Verde their most consistent attacking threat.' },
      { name: 'Garry Rodrigues', position: 'Right Wing / Left Wing', club: 'Aris Thessaloniki', description: 'A direct and pacy winger who has played across European football. Rodrigues\'s ability to beat defenders in wide areas, deliver crosses, and contribute goals make him one of Cape Verde\'s most dangerous attacking threats on either flank.' },
      { name: 'Stopira', position: 'Centre-Back', club: 'Getafe CF', description: 'The veteran centre-back whose experience in La Liga has given Cape Verde a defensive cornerstone. Stopira\'s aerial dominance, composure on the ball, and leadership at the back have been fundamental to Cape Verde\'s defensive solidity in qualifying.' },
    ]
  },
};

// ============================================================
// Scoring system for predictions
// ============================================================
const SCORING = {
  champion: 20,       // Correctly predict the champion
  finalist: 10,       // Correctly predict a finalist
  semi: 5,            // Correctly predict a semi-finalist
  quarter: 3,         // Correctly predict a quarter-finalist
  r16: 2,             // Correctly predict R16 qualifier
  r32: 1,             // Correctly predict R32 qualifier
  groupWinner: 2,     // Correctly predict a group winner
  groupSecond: 1,     // Correctly predict a group runner-up
};

// Avatar gradient colors for user avatars
const AVATAR_COLORS = [
  ['#f59e0b','#f97316'],
  ['#10b981','#059669'],
  ['#3b82f6','#6366f1'],
  ['#ec4899','#f43f5e'],
  ['#8b5cf6','#a855f7'],
  ['#14b8a6','#06b6d4'],
  ['#22c55e','#84cc16'],
  ['#fb923c','#f59e0b'],
];
