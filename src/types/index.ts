export type Difficulty = 'easy' | 'medium' | 'hard';

export interface CardItem {
  character: string;
  place:     string;
  opinion:   string;
}

export interface CardPool {
  characters: string[];
  places:     string[];
  opinions:   string[];
}

export type CardPools = Record<Difficulty, CardPool>;

// Extra material (доп. материал)
export interface ExtraMaterial {
  id:   string;
  text: string;
}

// Secret card effect types
export type SecretEffect =
  | { type: 'replace_words' }           // заменить до 3 слов во мнении
  | { type: 'prep_time_bonus'; seconds: number }  // +30с к подготовке
  | { type: 'answer_time_bonus'; seconds: number }// +30с к ответу
  | { type: 'replace_material' }        // заменить материал
  | { type: 'replace_any_card' }        // заменить любую карточку (своей или чужой)
  | { type: 'cancel_or_steal_card' }    // отменить/забрать карточку другой команды
  | { type: 'draw_new_opinion' }        // вытянуть новое мнение и выбрать
  | { type: 'ask_expert' }              // попросить подсказку у эксперта
  | { type: 'invite_leader' }           // привлечь лидера другой команды
  | { type: 'two_speakers' }            // могут выйти два человека
  | { type: 'pause_10s' }               // пауза 10 секунд во время диалога
  | { type: 'opponent_squats' }         // команда соперника приседает
  | { type: 'swap_speaker' }            // заменить отвечающего во время диалога
  | { type: 'older_40' }                // собеседник на 40 лет старше
  | { type: 'no_word_god' }             // нельзя говорить "Бог"
  | { type: 'only_questions' }          // отвечать только вопросами
  | { type: 'interrupted' }             // тебя перебивают
  | { type: 'bad_mood' }                // у персонажа плохое настроение
  | { type: 'one_sentence' }            // ответить одним предложением до 20 слов
  | { type: 'half_time' }               // время ответа в два раза меньше
  | { type: 'one_breath' }              // один вдох за всё время
  | { type: 'stand_one_leg' }           // стоять на одной ноге всей командой
  | { type: 'opponent_draw_opinion' }   // другая команда вытягивает новое мнение
  | { type: 'opponent_time_bonus'; seconds: number } // +15с сопернику
  | { type: 'start_with_b' }            // каждый ответ начинается с "Б"
  | { type: 'no_letter_o' }             // нельзя использовать букву "О"
  | { type: 'random_speaker' };         // отвечающий выбирается случайно

export interface SecretCard {
  id:          string;
  name:        string;
  description: string;
  positive:    boolean; // true = помощь, false = усложнение
  effect:      SecretEffect;
}

// What the effect does to game state automatically
export interface ActiveEffect {
  halfTime:          boolean;
  answerTimeBonus:   number;   // seconds added to answer timer
  prepTimeBonus:     number;   // seconds added to prep timer
  canPause10s:       boolean;  // button visible
  randomSpeaker:     boolean;
  canReplaceAnyCard: boolean;  // show replace buttons on cards
  canReplaceMaterial:boolean;
  canDrawNewOpinion: boolean;
  canSwapSpeaker:    boolean;
}

export function emptyEffect(): ActiveEffect {
  return {
    halfTime: false, answerTimeBonus: 0, prepTimeBonus: 0,
    canPause10s: false, randomSpeaker: false,
    canReplaceAnyCard: false, canReplaceMaterial: false,
    canDrawNewOpinion: false, canSwapSpeaker: false,
  };
}

export interface TeamState {
  card:          CardItem;
  material:      ExtraMaterial | null;
  secretCard:    SecretCard | null;
  effect:        ActiveEffect;
  answerSeconds: number;
  answerStarted: boolean;
  answerPaused:  boolean;
  answerDone:    boolean;
  pause10sUsed:  boolean;
  swapUsed:      boolean;
}

export type GamePhase =
  | 'idle'
  | 'pick_level'
  | 'spinning'
  | 'draw_material_1'
  | 'draw_material_2'
  | 'draw_secret_1'
  | 'draw_secret_2'
  | 'replace_cards'    // show replace buttons if applicable
  | 'prep'
  | 'answer_1'
  | 'answer_2'
  | 'round_summary';

export interface GameSession {
  difficulty:      Difficulty | null;
  usedCharacters:  Set<string>;
  usedPlaces:      Set<string>;
  usedOpinions:    Set<string>;
  usedMaterials:   Set<string>;
  usedSecrets:     Set<string>;
  roundCount:      number;
}
