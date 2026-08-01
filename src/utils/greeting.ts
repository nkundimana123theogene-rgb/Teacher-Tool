export function getTimeBasedGreeting(
  userName?: string | null,
  language: string = 'Kinyarwanda',
  selectedCountry: string = 'Rwanda'
) {
  const rawName = userName?.trim() || '';
  const name = rawName || 'Mwarimu';
  const displayName = (rawName && !rawName.toLowerCase().startsWith('mwarimu') && !rawName.toLowerCase().startsWith('teacher') && !rawName.toLowerCase().startsWith('enseignant')) 
    ? `Mwarimu ${rawName}` 
    : (rawName || 'Mwarimu');
  
  let hour = new Date().getHours();
  let minute = new Date().getMinutes();
  let gmtDisplay = 'GMT+2';
  let targetTimeZone = '';

  // Determine timezone by selected country or fallback to browser timezone
  if (selectedCountry === 'Rwanda' || selectedCountry === 'Burundi') {
    targetTimeZone = 'Africa/Kigali';
    gmtDisplay = 'GMT+2 (CAT)';
  } else if (selectedCountry === 'Uganda') {
    targetTimeZone = 'Africa/Kampala';
    gmtDisplay = 'GMT+3 (EAT)';
  } else if (selectedCountry === 'Kenya') {
    targetTimeZone = 'Africa/Nairobi';
    gmtDisplay = 'GMT+3 (EAT)';
  } else if (selectedCountry === 'Tanzania') {
    targetTimeZone = 'Africa/Dar_es_Salaam';
    gmtDisplay = 'GMT+3 (EAT)';
  } else if (selectedCountry === 'DRC' || selectedCountry === 'DR Congo') {
    targetTimeZone = 'Africa/Lubumbashi';
    gmtDisplay = 'GMT+2 (CAT)';
  } else {
    // Client browser local timezone
    try {
      targetTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      targetTimeZone = 'UTC';
    }
    const offsetMinutes = -new Date().getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
    const sign = offsetMinutes >= 0 ? '+' : '-';
    gmtDisplay = `GMT${sign}${offsetHours}`;
  }

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTimeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(new Date());
    const hourVal = parts.find(p => p.type === 'hour')?.value;
    const minVal = parts.find(p => p.type === 'minute')?.value;
    if (hourVal) hour = parseInt(hourVal, 10);
    if (minVal) minute = parseInt(minVal, 10);
  } catch {
    hour = new Date().getHours();
    minute = new Date().getMinutes();
  }

  const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  let timePeriod: 'morning' | 'afternoon' | 'evening' | 'night' = 'evening';
  let timeIcon = '🌆';

  if (hour >= 5 && hour < 12) {
    timePeriod = 'morning';
    timeIcon = '🌅';
  } else if (hour >= 12 && hour < 17) {
    timePeriod = 'afternoon';
    timeIcon = '☀️';
  } else if (hour >= 17 && hour < 22) {
    timePeriod = 'evening';
    timeIcon = '🌆';
  } else {
    timePeriod = 'night';
    timeIcon = '🌙';
  }

  const lang = language.toLowerCase();

  // Kinyarwanda
  if (lang.includes('kinya') || lang.includes('rwanda')) {
    if (timePeriod === 'morning') {
      return {
        title: `Mwaramutse neza, ${displayName}! ${timeIcon}`,
        subtext: `Mwaramutse, ${displayName}! AI Welcome Assistant iri hano kugufasha gutegura Lesson Plan y'umunsi mu amasegonda macye. [Saha: ${timeStr} • ${gmtDisplay}]`,
        greetingWord: "Mwaramutse",
        aiBadge: `🤖 AI Welcome Assistant • ${gmtDisplay} (${timeStr})`,
        timePeriod,
        timeIcon,
        formattedTime: timeStr,
        gmtDisplay
      };
    } else if (timePeriod === 'afternoon') {
      return {
        title: `Mwiriwe neza, ${displayName}! ${timeIcon}`,
        subtext: `Mwiriwe, ${displayName}! Ikaze muri system ya Teacher Tool Lesson Plans. AI yacu yiteguye kugufasha kureba no gutegura amamasomo yawe uyu munsi. [Saha: ${timeStr} • ${gmtDisplay}]`,
        greetingWord: "Mwiriwe",
        aiBadge: `🤖 AI Welcome Assistant • ${gmtDisplay} (${timeStr})`,
        timePeriod,
        timeIcon,
        formattedTime: timeStr,
        gmtDisplay
      };
    } else if (timePeriod === 'evening') {
      return {
        title: `Mwiriwe n'umugoroba, ${displayName}! ${timeIcon}`,
        subtext: `Mwiriwe n'umugoroba, ${displayName}! Ikaze muri Teacher Tool Lesson Plans. AI yiteguye kugufasha gutegura no kubika Lesson Plans za ejo ku gihe. [Saha: ${timeStr} • ${gmtDisplay}]`,
        greetingWord: "Mwiriwe Umugoroba",
        aiBadge: `🤖 AI Welcome Assistant • ${gmtDisplay} (${timeStr})`,
        timePeriod,
        timeIcon,
        formattedTime: timeStr,
        gmtDisplay
      };
    } else {
      return {
        title: `Ikaze n'ijoro, ${displayName}! ${timeIcon}`,
        subtext: `Ijoro ryiza, ${displayName}! System ya Teacher Tool Lesson Plans ikora amasaha 24/24 (24/7/365). AI yacu yiteguye kugufasha gutegura isomo ryawe n'ijoro. [Saha: ${timeStr} • ${gmtDisplay}]`,
        greetingWord: "Ijoro Ryiza",
        aiBadge: `🤖 AI Welcome Assistant • ${gmtDisplay} (${timeStr})`,
        timePeriod,
        timeIcon,
        formattedTime: timeStr,
        gmtDisplay
      };
    }
  }

  // French
  if (lang.includes('french') || lang.includes('francais')) {
    if (timePeriod === 'morning') {
      return {
        title: `Bonjour, ${displayName}! ${timeIcon}`,
        subtext: `Bonjour ${displayName}! L'assistant IA de Teacher Tool Lesson Plans est prêt à vous aider à préparer votre fiche de leçon. [Heure: ${timeStr} • ${gmtDisplay}]`,
        greetingWord: "Bonjour",
        aiBadge: `🤖 IA Welcome Assistant • ${gmtDisplay} (${timeStr})`,
        timePeriod,
        timeIcon,
        formattedTime: timeStr,
        gmtDisplay
      };
    } else if (timePeriod === 'afternoon') {
      return {
        title: `Bon Après-midi, ${displayName}! ${timeIcon}`,
        subtext: `Bon après-midi ${displayName}! Bienvenue sur la plateforme Teacher Tool. [Heure: ${timeStr} • ${gmtDisplay}]`,
        greetingWord: "Bon Après-midi",
        aiBadge: `🤖 IA Welcome Assistant • ${gmtDisplay} (${timeStr})`,
        timePeriod,
        timeIcon,
        formattedTime: timeStr,
        gmtDisplay
      };
    } else if (timePeriod === 'evening') {
      return {
        title: `Bonsoir, ${displayName}! ${timeIcon}`,
        subtext: `Bonsoir ${displayName}! Bienvenue ce soir sur Teacher Tool Lesson Plans. [Heure: ${timeStr} • ${gmtDisplay}]`,
        greetingWord: "Bonsoir",
        aiBadge: `🤖 IA Welcome Assistant • ${gmtDisplay} (${timeStr})`,
        timePeriod,
        timeIcon,
        formattedTime: timeStr,
        gmtDisplay
      };
    } else {
      return {
        title: `Bonne Nuit & Bienvenue, ${displayName}! ${timeIcon}`,
        subtext: `Bonne nuit ${displayName}! Notre service Teacher Tool reste actif 24/7. [Heure: ${timeStr} • ${gmtDisplay}]`,
        greetingWord: "Bonne Nuit",
        aiBadge: `🤖 IA Welcome Assistant • ${gmtDisplay} (${timeStr})`,
        timePeriod,
        timeIcon,
        formattedTime: timeStr,
        gmtDisplay
      };
    }
  }

  // Swahili
  if (lang.includes('swahili')) {
    if (timePeriod === 'morning') {
      return {
        title: `Habari ya Asubuhi, ${displayName}! ${timeIcon}`,
        subtext: `Habari ya asubuhi ${displayName}! Msaidizi wa AI wa Teacher Tool yuko tayari. [Muda: ${timeStr} • ${gmtDisplay}]`,
        greetingWord: "Habari ya Asubuhi",
        aiBadge: `🤖 AI Welcome Assistant • ${gmtDisplay} (${timeStr})`,
        timePeriod,
        timeIcon,
        formattedTime: timeStr,
        gmtDisplay
      };
    } else if (timePeriod === 'afternoon') {
      return {
        title: `Habari ya Mchana, ${displayName}! ${timeIcon}`,
        subtext: `Habari ya mchana ${displayName}! Karibu kwenye mfumo wa Teacher Tool. [Muda: ${timeStr} • ${gmtDisplay}]`,
        greetingWord: "Habari ya Mchana",
        aiBadge: `🤖 AI Welcome Assistant • ${gmtDisplay} (${timeStr})`,
        timePeriod,
        timeIcon,
        formattedTime: timeStr,
        gmtDisplay
      };
    } else if (timePeriod === 'evening') {
      return {
        title: `Habari ya Jioni, ${displayName}! ${timeIcon}`,
        subtext: `Habari ya jioni ${displayName}! Karibu jioni hii kwenye Teacher Tool. [Muda: ${timeStr} • ${gmtDisplay}]`,
        greetingWord: "Habari ya Jioni",
        aiBadge: `🤖 AI Welcome Assistant • ${gmtDisplay} (${timeStr})`,
        timePeriod,
        timeIcon,
        formattedTime: timeStr,
        gmtDisplay
      };
    } else {
      return {
        title: `Usiku Mwema & Karibu, ${displayName}! ${timeIcon}`,
        subtext: `Habari ya usiku ${displayName}! Mfumo wa Teacher Tool unahudumu masaa 24/7. [Muda: ${timeStr} • ${gmtDisplay}]`,
        greetingWord: "Usiku Mwema",
        aiBadge: `🤖 AI Welcome Assistant • ${gmtDisplay} (${timeStr})`,
        timePeriod,
        timeIcon,
        formattedTime: timeStr,
        gmtDisplay
      };
    }
  }

  // English
  if (timePeriod === 'morning') {
    return {
      title: `Good Morning, ${displayName}! ${timeIcon}`,
      subtext: `Good morning ${displayName}! Your AI Welcome Assistant is ready to help you generate lesson plans. [Time: ${timeStr} • ${gmtDisplay}]`,
      greetingWord: "Good Morning",
      aiBadge: `🤖 AI Welcome Assistant • ${gmtDisplay} (${timeStr})`,
      timePeriod,
      timeIcon,
      formattedTime: timeStr,
      gmtDisplay
    };
  } else if (timePeriod === 'afternoon') {
    return {
      title: `Good Afternoon, ${displayName}! ${timeIcon}`,
      subtext: `Good afternoon ${displayName}! Welcome to Teacher Tool Lesson Plans. [Time: ${timeStr} • ${gmtDisplay}]`,
      greetingWord: "Good Afternoon",
      aiBadge: `🤖 AI Welcome Assistant • ${gmtDisplay} (${timeStr})`,
      timePeriod,
      timeIcon,
      formattedTime: timeStr,
      gmtDisplay
    };
  } else if (timePeriod === 'evening') {
    return {
      title: `Good Evening, ${displayName}! ${timeIcon}`,
      subtext: `Good evening ${displayName}! Welcome to Teacher Tool Lesson Plans. [Time: ${timeStr} • ${gmtDisplay}]`,
      greetingWord: "Good Evening",
      aiBadge: `🤖 AI Welcome Assistant • ${gmtDisplay} (${timeStr})`,
      timePeriod,
      timeIcon,
      formattedTime: timeStr,
      gmtDisplay
    };
  } else {
    return {
      title: `Welcome & Good Night, ${displayName}! ${timeIcon}`,
      subtext: `Hello ${displayName}! Teacher Tool Lesson Plans operates 24/7/365. [Time: ${timeStr} • ${gmtDisplay}]`,
      greetingWord: "Good Night",
      aiBadge: `🤖 AI Welcome Assistant • ${gmtDisplay} (${timeStr})`,
      timePeriod,
      timeIcon,
      formattedTime: timeStr,
      gmtDisplay
    };
  }
}
