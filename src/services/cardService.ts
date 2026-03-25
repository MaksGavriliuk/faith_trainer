import type {
    ActiveEffect,
    CardItem,
    CardPools,
    Difficulty,
    ExtraMaterial,
    SecretCard,
    SecretEffect,
    TeamState,
} from '../types';
import {emptyEffect} from '../types';

// ── CARD POOLS ────────────────────────────────────────────────────────────────
export const CARD_POOLS: CardPools = {
    easy: {
        characters: [
            'Ребёнок', 'Одноклассник', 'Подросток', 'Студент', 'Геймер',
            'Программист', 'Музыкант', 'Спортсмен', 'Популярный блогер',
        ],
        places: [
            'Дома', 'В школе', 'На скамейке во дворе', 'В гостях',
            'В музее', 'На тренировке', 'В кафе', 'Попутчики',
        ],
        opinions: [
            'Я ещё успею подумать про Бога, а пока мне некогда',
            'Мои друзья и семья не верят, и я не хочу идти против их мнения',
            'Какая мне выгода становиться христианином? Мне и так хорошо',
            'Я верю в душе, но в церковь не пойду',
            'Я ничего не знаю о христианстве, но готов услышать о Боге',
            'Хорошим человеком можно быть и без Бога',
            'Современная церковь никак не связана с Богом, это инструмент для манипуляции и выкачивания денег',
        ],
    },
    medium: {
        characters: [
            'Преподаватель', 'Человек из зарубежной страны', 'Бизнесмен',
            'БОМЖ', 'Учёный', 'Доктор', 'Патриот',
        ],
        places: [
            'На остановке', 'Стоите в очереди', 'На уличной евангелизации',
            'На отдыхе', 'В библиотеке (надо говорить шёпотом)',
            'В церкви',
        ],
        opinions: [
            'Чем христианство лучше других религий?',
            'Христианство претендует на исключительность. Но у каждого своя правда',
            'Как можно верить Библии, если её сто раз переписывали и мы не видели оригинала?',
            'Если Бог меня любит, почему Он допустил горе в моей жизни?',
            'Бог нужен только слабым людям, а сильным достаточно самих себя',
            'Примитивные люди придумали религию, когда не понимали природных явлений. Но теперь мы всё знаем',
            'Я слишком много нагрешил, чтобы Бог меня простил. Для меня уже поздно',
        ],
    },
    hard: {
        characters: [
            'Женщина в слезах', 'Человек в депрессии', 'Неизлечимо больной',
            'Человек, которого вы обидели в прошлом', 'ЛГБТ-персона',
            'Бывший верующий, который ушёл из церкви',
        ],
        places: [
            'В больнице', 'Во время дорожной аварии', 'На кладбище',
            'Прячетесь вместе во время дождя',
            'Едете в лифте (в два раза меньше времени на ответ)',
            'В гостях у тяжело больного человека',
        ],
        opinions: [
            'Бог отправляет добрых людей в ад только за то, что они в Него не верят. Как-то жестоко для любящего Бога',
            'Что если это вы ошибаетесь? Что если Бога нет?',
            'Миллионы людей погибли из-за религии. Крестовые походы, джихады… Религия приносит только смерть и страдания',
            'Зачем Бог сотворил Адама и Еву, поместив запретное дерево перед ними?',
            'Почему Бог не явится прямо сейчас? Тогда бы я поверил',
            'Если Бог хочет, чтобы все Ему поклонялись, значит Он эгоист',
        ],
    },
};

// ── EXTRA MATERIALS ───────────────────────────────────────────────────────────
export const EXTRA_MATERIALS: ExtraMaterial[] = [
    {id: 'em1', text: 'Притча о блудном сыне'},
    {id: 'em2', text: 'Личный опыт'},
    {id: 'em3', text: 'История о Иосифе'},
    {id: 'em4', text: 'Слова Иисуса в Гефсиманском саду'},
    {id: 'em5', text: 'Свидетельство (своё или чужое)'},
    {id: 'em6', text: 'Притча о милосердном самарянине'},
    {id: 'em7', text: 'Стих из Библии'},
    {id: 'em8', text: 'Воспоминание из детства'},
    {id: 'em9', text: 'Христианская песня'},
    {id: 'em10', text: 'Жизненный совет'},
    {id: 'em11', text: 'Современный мем или комикс'},
    {id: 'em12', text: 'Бита'},
    {id: 'em13', text: 'Цветок'},
    {id: 'em14', text: 'Хлеб'},
    {id: 'em15', text: 'Наполовину полный стакан'},
    {id: 'em16', text: 'Фотография'},
    {id: 'em17', text: 'Ключ'},
    {id: 'em18', text: 'Лампочка'},
    {id: 'em19', text: 'Маленький щенок или котёнок'},
    {id: 'em20', text: 'Карта сокровищ'},
    {id: 'em21', text: 'Очки'},
    {id: 'em22', text: 'Фонарик'},
    {id: 'em23', text: 'Гитара'},
    {id: 'em24', text: 'Часы'},
    {id: 'em25', text: 'Рюкзак'},
    {id: 'em26', text: 'Камень'},
];

// ── SECRET CARDS ──────────────────────────────────────────────────────────────
export const SECRET_CARDS: SecretCard[] = [
    // ПОМОЩЬ
    {
        id: 's1',
        positive: true,
        name: 'Редактор',
        description: 'Можно заменить до 3 слов во мнении',
        effect: {type: 'replace_words'}
    },
    {
        id: 's2',
        positive: true,
        name: '+30 к подготовке',
        description: '+30 секунд дополнительного времени на подготовку',
        effect: {type: 'prep_time_bonus', seconds: 30}
    },
    {
        id: 's3',
        positive: true,
        name: '+10 к диалогу',
        description: '+10 секунд времени на диалог',
        effect: {type: 'answer_time_bonus', seconds: 10}
    },
    {
        id: 's4',
        positive: true,
        name: 'Замена материала',
        description: 'Можно заменить материал',
        effect: {type: 'replace_material'}
    },
    {
        id: 's5',
        positive: true,
        name: 'Джокер',
        description: 'Можно заменить любую карточку — свою или чужой команды',
        effect: {type: 'replace_any_card'}
    },
    {
        id: 's6',
        positive: true,
        name: 'Щит',
        description: 'Можно отменить действие карточки другой команды или забрать себе',
        effect: {type: 'cancel_or_steal_card'}
    },
    {
        id: 's7',
        positive: true,
        name: 'Второй шанс',
        description: 'Можно вытянуть новое мнение и выбрать лучшее',
        effect: {type: 'draw_new_opinion'}
    },
    {
        id: 's8',
        positive: true,
        name: 'Эксперт',
        description: 'Можно попросить подсказку у одного из экспертов',
        effect: {type: 'ask_expert'}
    },
    {
        id: 's9',
        positive: true,
        name: 'Союзник',
        description: 'Можно привлечь любого лидера другой команды',
        effect: {type: 'invite_leader'}
    },
    {
        id: 's10',
        positive: true,
        name: 'Дуэт',
        description: 'Могут выйти два человека от команды на диалог',
        effect: {type: 'two_speakers'}
    },
    {
        id: 's11',
        positive: true,
        name: 'Пауза 10 сек',
        description: 'Можно во время диалога один раз нажать на паузу на 10 секунд',
        effect: {type: 'pause_10s'}
    },
    {
        id: 's12',
        positive: true,
        name: 'Фитнес',
        description: 'Команда соперника во время ответа должна приседать',
        effect: {type: 'opponent_squats'}
    },
    {
        id: 's13',
        positive: true,
        name: 'Замена',
        description: 'Можно во время ответа остановить диалог и 1 раз заменить отвечающего',
        effect: {type: 'swap_speaker'}
    },
    // УСЛОЖНЕНИЕ
    {
        id: 's14',
        positive: false,
        name: 'Дедушка',
        description: 'Собеседник становится на 40 лет старше',
        effect: {type: 'older_40'}
    },
    {
        id: 's15',
        positive: false,
        name: 'Табу',
        description: 'Нельзя использовать слово «Бог»',
        effect: {type: 'no_word_god'}
    },
    {
        id: 's16',
        positive: false,
        name: 'Только вопросы',
        description: 'Отвечать нужно только вопросами',
        effect: {type: 'only_questions'}
    },
    {id: 's17', positive: false, name: 'Перебивают', description: 'Тебя перебивают', effect: {type: 'interrupted'}},
    {
        id: 's18',
        positive: false,
        name: 'Плохое настроение',
        description: 'У персонажа плохое настроение',
        effect: {type: 'bad_mood'}
    },
    {
        id: 's19',
        positive: false,
        name: 'Одним словом',
        description: 'Ответить нужно одним предложением (до 20 слов)',
        effect: {type: 'one_sentence'}
    },
    {
        id: 's20',
        positive: false,
        name: 'Цейтнот',
        description: 'Время ответа сокращается в два раза',
        effect: {type: 'half_time'}
    },
    {
        id: 's21',
        positive: false,
        name: 'Один вдох',
        description: 'Во время ответа можно вдохнуть только 1 раз',
        effect: {type: 'one_breath'}
    },
    {
        id: 's22',
        positive: false,
        name: 'Цапля',
        description: 'Вся команда стоит на одной ноге. Если кто-то поставил ногу — время закончено',
        effect: {type: 'stand_one_leg'}
    },
    {
        id: 's23',
        positive: false,
        name: 'Выбор соперника',
        description: 'Другая команда может вытянуть новое мнение и выбрать лучшee',
        effect: {type: 'opponent_draw_opinion'}
    },
    {
        id: 's24',
        positive: false,
        name: '+15 сопернику',
        description: '+15 секунд команде соперников на ответ',
        effect: {type: 'opponent_time_bonus', seconds: 15}
    },
    {
        id: 's25',
        positive: false,
        name: 'Буква Б',
        description: 'Каждый ваш ответ должен начинаться с буквы «Б»',
        effect: {type: 'start_with_b'}
    },
    {
        id: 's26',
        positive: false,
        name: 'Без «О»',
        description: 'При ответе нельзя использовать букву «О»',
        effect: {type: 'no_letter_o'}
    },
    {
        id: 's27',
        positive: false,
        name: 'Случайный',
        description: 'Отвечающий выбирается случайно',
        effect: {type: 'random_speaker'}
    },
];

// ── BASE ANSWER TIME ──────────────────────────────────────────────────────────
export const BASE_ANSWER_SECONDS: Record<Difficulty, number> = {
    // easy: 120, medium: 90, hard: 60,
    easy: 40, medium: 40, hard: 40,
};
export const PREP_SECONDS = 120;

// ── HELPERS ───────────────────────────────────────────────────────────────────
function pickRandom<T>(arr: T[], exclude: Set<string>, getId: (item: T) => string): T {
    const available = arr.filter(i => !exclude.has(getId(i)));
    const pool = available.length > 0 ? available : arr;
    return pool[Math.floor(Math.random() * pool.length)];
}

function pickRandomStr(arr: string[], exclude: Set<string>): string {
    const available = arr.filter(s => !exclude.has(s));
    const pool = available.length > 0 ? available : arr;
    return pool[Math.floor(Math.random() * pool.length)];
}

export function generateCards(
    difficulty: Difficulty,
    usedChars: Set<string>, usedPlaces: Set<string>, usedOpinions: Set<string>
): { team1: CardItem; team2: CardItem } {
    const pool = CARD_POOLS[difficulty];
    const c1 = pickRandomStr(pool.characters, usedChars);
    const c2 = pickRandomStr(pool.characters, new Set([...usedChars, c1]));
    const p1 = pickRandomStr(pool.places, usedPlaces);
    const p2 = pickRandomStr(pool.places, new Set([...usedPlaces, p1]));
    const o1 = pickRandomStr(pool.opinions, usedOpinions);
    const o2 = pickRandomStr(pool.opinions, new Set([...usedOpinions, o1]));
    return {
        team1: {character: c1, place: p1, opinion: o1},
        team2: {character: c2, place: p2, opinion: o2},
    };
}

export function drawMaterial(usedIds: Set<string>): ExtraMaterial {
    return pickRandom(EXTRA_MATERIALS, usedIds, m => m.id);
}

export function drawSecret(usedIds: Set<string>): SecretCard {
    return pickRandom(SECRET_CARDS, usedIds, s => s.id);
}

export function drawRandomOpinion(difficulty: Difficulty, exclude: string[]): string {
    const pool = CARD_POOLS[difficulty].opinions.filter(o => !exclude.includes(o));
    const arr = pool.length > 0 ? pool : CARD_POOLS[difficulty].opinions;
    return arr[Math.floor(Math.random() * arr.length)];
}

export function drawRandomCard(difficulty: Difficulty, field: 'characters' | 'places' | 'opinions', exclude: string[]): string {
    const pool = CARD_POOLS[difficulty][field].filter(s => !exclude.includes(s));
    const arr = pool.length > 0 ? pool : CARD_POOLS[difficulty][field];
    return arr[Math.floor(Math.random() * arr.length)];
}

// ── EFFECT COMPUTATION ────────────────────────────────────────────────────────
export function computeEffect(secret: SecretCard | null): ActiveEffect {
    const e = emptyEffect();
    if (!secret) return e;
    const eff: SecretEffect = secret.effect;
    switch (eff.type) {
        case 'prep_time_bonus':
            e.prepTimeBonus = eff.seconds;
            break;
        case 'answer_time_bonus':
            e.answerTimeBonus = eff.seconds;
            break;
        case 'half_time':
            e.halfTime = true;
            break;
        case 'pause_10s':
            e.canPause10s = true;
            break;
        case 'random_speaker':
            e.randomSpeaker = true;
            break;
        case 'replace_any_card':
            e.canReplaceAnyCard = true;
            break;
        case 'replace_material':
            e.canReplaceMaterial = true;
            break;
        case 'draw_new_opinion':
            e.canDrawNewOpinion = true;
            break;
        case 'swap_speaker':
            e.canSwapSpeaker = true;
            break;
        default:
            break;
    }
    return e;
}

// Opponent effects: secret card of one team may affect the other
export function computeOpponentEffect(secret: SecretCard | null): Partial<ActiveEffect> {
    if (!secret) return {};
    const eff = secret.effect;
    if (eff.type === 'opponent_time_bonus') return {answerTimeBonus: eff.seconds};
    return {};
}

export function computeAnswerSeconds(
    base: number,
    mySecret: SecretCard | null,
    opponentSecret: SecretCard | null,
    placeIsLift: boolean,
): number {
    let t = base;
    if (mySecret?.effect.type === 'answer_time_bonus') t += (mySecret.effect as {
        type: 'answer_time_bonus';
        seconds: number
    }).seconds;
    if (mySecret?.effect.type === 'half_time') t = Math.floor(t / 2);
    if (opponentSecret?.effect.type === 'opponent_time_bonus') t += (opponentSecret.effect as {
        type: 'opponent_time_bonus';
        seconds: number
    }).seconds;
    if (placeIsLift) t = Math.floor(t / 2);
    return Math.max(15, t);
}

export function computePrepSeconds(
    base: number,
    secret1: SecretCard | null,
    secret2: SecretCard | null,
): number {
    let t = base;
    if (secret1?.effect.type === 'prep_time_bonus') t += (secret1.effect as {
        type: 'prep_time_bonus';
        seconds: number
    }).seconds;
    if (secret2?.effect.type === 'prep_time_bonus') t += (secret2.effect as {
        type: 'prep_time_bonus';
        seconds: number
    }).seconds;
    return t;
}

export function isLiftPlace(place: string): boolean {
    return place.toLowerCase().includes('лифте');
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
    easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный',
};

export function emptyTeamState(base: number): TeamState {
    return {
        card: {character: '—', place: '—', opinion: '—'},
        material: null, secretCard: null,
        effect: emptyEffect(),
        answerSeconds: base,
        answerStarted: false, answerPaused: false, answerDone: false,
        pause10sUsed: false, swapUsed: false,
    };
}
