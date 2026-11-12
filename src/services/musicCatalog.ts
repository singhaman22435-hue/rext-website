import { Track, Playlist } from '../types';
import { youtubeSearchService } from './youtubeSearchService';

export const CURATED_TRACKS: Track[] = [
  // 1. Pop & Global Hits
  {
    id: 'yt-34Na4j8AVgA',
    youtubeId: '34Na4j8AVgA',
    source: 'youtube',
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    album: 'Starboy',
    coverUrl: 'https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=34Na4j8AVgA',
    duration: 230,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2016,
    bassLevel: 92,
    plays: 2450000000,
    lyrics: [
      { time: 0, text: "I'm tryna put you in the worst mood, ah" },
      { time: 8, text: "P1 cleaner than your church shoes, ah" },
      { time: 16, text: "Milli point two just to hurt you, ah" },
      { time: 24, text: "All red Lamb' just to tease you, ah" },
      { time: 30, text: "Look what you've done, I'm a starboy" }
    ]
  },
  {
    id: 'yt-4NRXx6U8ABQ',
    youtubeId: '4NRXx6U8ABQ',
    source: 'youtube',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    coverUrl: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ',
    duration: 260,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2020,
    bassLevel: 88,
    plays: 820000000,
    lyrics: [
      { time: 0, text: "I've been tryna call, I've been on my own for long enough" },
      { time: 12, text: "Maybe you can show me how to love, maybe" },
      { time: 24, text: "I said, ooh, I'm blinded by the lights" },
      { time: 34, text: "No, I can't sleep until I feel your touch" }
    ]
  },
  {
    id: 'yt-TUVcZfQe-Kw',
    youtubeId: 'TUVcZfQe-Kw',
    source: 'youtube',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    coverUrl: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=TUVcZfQe-Kw',
    duration: 203,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2020,
    bassLevel: 84,
    plays: 910000000,
    lyrics: [
      { time: 0, text: "If you wanna run away with me, I know a galaxy" },
      { time: 8, text: "And I can take you for a ride" },
      { time: 16, text: "You want me, I want you baby, my sugarboo, I'm levitating" }
    ]
  },
  {
    id: 'yt-DyDfgMOUjCI',
    youtubeId: 'DyDfgMOUjCI',
    source: 'youtube',
    title: 'bad guy',
    artist: 'Billie Eilish',
    album: 'WHEN WE ALL FALL ASLEEP',
    coverUrl: 'https://i.ytimg.com/vi/DyDfgMOUjCI/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=DyDfgMOUjCI',
    duration: 194,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2019,
    bassLevel: 95,
    plays: 1300000000,
    lyrics: [
      { time: 0, text: "White shirt now red, my bloody nose" },
      { time: 8, text: "Sleepin', you're on your tippy-toes" },
      { time: 16, text: "So you're a tough guy, like it really rough guy" },
      { time: 25, text: "I'm the bad guy, duh" }
    ]
  },
  {
    id: 'yt-JGwWNGJdvx8',
    youtubeId: 'JGwWNGJdvx8',
    source: 'youtube',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    coverUrl: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
    duration: 263,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2017,
    bassLevel: 80,
    plays: 6200000000,
    lyrics: [
      { time: 0, text: "The club isn't the best place to find a lover" },
      { time: 10, text: "So the bar is where I go" },
      { time: 20, text: "I'm in love with the shape of you" }
    ]
  },
  {
    id: 'yt-H5v3kku4y6Q',
    youtubeId: 'H5v3kku4y6Q',
    source: 'youtube',
    title: 'As It Was',
    artist: 'Harry Styles',
    album: "Harry's House",
    coverUrl: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=H5v3kku4y6Q',
    duration: 167,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2022,
    bassLevel: 82,
    plays: 720000000,
    lyrics: [
      { time: 0, text: "Holdin' me back, gravity's holdin' me back" },
      { time: 10, text: "You know it's not the same as it was" }
    ]
  },
  {
    id: 'yt-ic8j13piAhQ',
    youtubeId: 'ic8j13piAhQ',
    source: 'youtube',
    title: 'Cruel Summer',
    artist: 'Taylor Swift',
    album: 'Lover',
    coverUrl: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=ic8j13piAhQ',
    duration: 178,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2019,
    bassLevel: 85,
    plays: 450000000,
    lyrics: [
      { time: 0, text: "Fever dream high in the quiet of the night" },
      { time: 12, text: "It's a cruel summer" }
    ]
  },

  // 2. Desi & Punjabi
  {
    id: 'yt-VNs_cCtdbPc',
    youtubeId: 'VNs_cCtdbPc',
    source: 'youtube',
    title: 'BROWN MUNDE',
    artist: 'AP Dhillon, Gurinder Gill, Shinda Kahlon',
    album: 'Brown Munde',
    coverUrl: 'https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=VNs_cCtdbPc',
    duration: 268,
    genre: 'Desi',
    bitrate: 'YouTube HQ Stream',
    year: 2020,
    bassLevel: 95,
    plays: 640000000,
    lyrics: [
      { time: 0, text: "Gaddi lambi car te tezz raftaar" },
      { time: 12, text: "Sada challe naam jivein chalda bazaar" },
      { time: 24, text: "Desi jehe geet aa trap jehi beat aa" },
      { time: 32, text: "Brown Munde, Brown Munde" }
    ]
  },
  {
    id: 'yt-BddP6PYo2gs',
    youtubeId: 'BddP6PYo2gs',
    source: 'youtube',
    title: 'Kesariya - Brahmāstra (Full Audio Song)',
    artist: 'Arijit Singh, Pritam',
    album: 'Brahmāstra',
    coverUrl: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=BddP6PYo2gs',
    duration: 268,
    genre: 'Desi',
    bitrate: 'YouTube HQ Stream',
    year: 2022,
    bassLevel: 80,
    plays: 580000000,
    lyrics: [
      { time: 0, text: "Mujhko itna bataye koi, kaise tujhse dil na lagaye koi" },
      { time: 15, text: "Rabba ne tujhko banane mein kardi hai husn ki khaali tijoriyan" },
      { time: 28, text: "Kesariya tera ishq hai piya, rang jaaun jo main haath lagaun" }
    ]
  },
  {
    id: 'yt-n_FCrCQ6-bA',
    youtubeId: 'n_FCrCQ6-bA',
    source: 'youtube',
    title: '295',
    artist: 'Sidhu Moose Wala',
    album: 'Moosetape',
    coverUrl: 'https://i.ytimg.com/vi/n_FCrCQ6-bA/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=n_FCrCQ6-bA',
    duration: 270,
    genre: 'Desi',
    bitrate: 'YouTube HQ Stream',
    year: 2021,
    bassLevel: 94,
    plays: 750000000,
    lyrics: [
      { time: 0, text: "Dass kihda ae kasoor kide utte case kare" },
      { time: 12, text: "Kihnu judge mann ke tu aivein aada la leya" },
      { time: 24, text: "Ni 295 je karega tarakki putt hate milugi" }
    ]
  },
  {
    id: 'yt-5Eqb_-j3FDA',
    youtubeId: '5Eqb_-j3FDA',
    source: 'youtube',
    title: 'Pasoori - Coke Studio Season 14',
    artist: 'Ali Sethi & Shae Gill',
    album: 'Coke Studio',
    coverUrl: 'https://i.ytimg.com/vi/5Eqb_-j3FDA/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=5Eqb_-j3FDA',
    duration: 224,
    genre: 'Desi',
    bitrate: 'YouTube HQ Stream',
    year: 2022,
    bassLevel: 82,
    plays: 780000000,
    lyrics: [
      { time: 0, text: "Agg laawan majboori nu" },
      { time: 8, text: "Aan jaan di pasoori nu" },
      { time: 18, text: "Zahar bane haan teri, pee jaawan main poori nu" }
    ]
  },
  {
    id: 'yt-4tywp83zkmk',
    youtubeId: '4tywp83zkmk',
    source: 'youtube',
    title: 'Cheques',
    artist: 'Shubh',
    album: 'Still Rollin',
    coverUrl: 'https://i.ytimg.com/vi/4tywp83zkmk/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=4tywp83zkmk',
    duration: 184,
    genre: 'Desi',
    bitrate: 'YouTube HQ Stream',
    year: 2023,
    bassLevel: 96,
    plays: 350000000,
    lyrics: [
      { time: 0, text: "Jadon turran naal mere kaafle" },
      { time: 10, text: "Gaddi ch flow chale agg wangran" },
      { time: 20, text: "Cheques aunde sign hunde lakh wangran" }
    ]
  },
  {
    id: 'yt-mH_LFkWxpI0',
    youtubeId: 'mH_LFkWxpI0',
    source: 'youtube',
    title: 'Lover',
    artist: 'Diljit Dosanjh',
    album: 'MoonChild Era',
    coverUrl: 'https://i.ytimg.com/vi/mH_LFkWxpI0/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=mH_LFkWxpI0',
    duration: 190,
    genre: 'Desi',
    bitrate: 'YouTube HQ Stream',
    year: 2021,
    bassLevel: 90,
    plays: 180000000,
    lyrics: [
      { time: 0, text: "Jadon di tere naal laggi ae yaari" },
      { time: 12, text: "Main tera lover, tu meri crush" }
    ]
  },
  {
    id: 'yt-Umqb9KENgmk',
    youtubeId: 'Umqb9KENgmk',
    source: 'youtube',
    title: 'Tum Hi Ho',
    artist: 'Arijit Singh',
    album: 'Aashiqui 2',
    coverUrl: 'https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=Umqb9KENgmk',
    duration: 262,
    genre: 'Desi',
    bitrate: 'YouTube HQ Stream',
    year: 2013,
    bassLevel: 78,
    plays: 890000000,
    lyrics: [
      { time: 0, text: "Hum tere bin ab reh nahi sakte" },
      { time: 10, text: "Kyunki tum hi ho, ab tum hi ho, zindagi ab tum hi ho" }
    ]
  },

  // 3. Hip-Hop & Trap
  {
    id: 'yt-6ONRf7h3Mdk',
    youtubeId: '6ONRf7h3Mdk',
    source: 'youtube',
    title: 'SICKO MODE',
    artist: 'Travis Scott ft. Drake',
    album: 'ASTROWORLD',
    coverUrl: 'https://i.ytimg.com/vi/6ONRf7h3Mdk/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=6ONRf7h3Mdk',
    duration: 312,
    genre: 'Hip-Hop',
    bitrate: 'YouTube HQ Stream',
    year: 2018,
    bassLevel: 98,
    plays: 1200000000,
    lyrics: [
      { time: 0, text: "Sun is down, freezin' cold" },
      { time: 12, text: "That's how we already know winter's here" },
      { time: 24, text: "Out like a light, ayy, yeah" }
    ]
  },
  {
    id: 'yt-Dst9gZkq1a8',
    youtubeId: 'Dst9gZkq1a8',
    source: 'youtube',
    title: 'goosebumps',
    artist: 'Travis Scott ft. Kendrick Lamar',
    album: 'Birds in the Trap',
    coverUrl: 'https://i.ytimg.com/vi/Dst9gZkq1a8/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=Dst9gZkq1a8',
    duration: 243,
    genre: 'Hip-Hop',
    bitrate: 'YouTube HQ Stream',
    year: 2016,
    bassLevel: 96,
    plays: 980000000,
    lyrics: [
      { time: 0, text: "I get those goosebumps every time, yeah" },
      { time: 10, text: "You come around, yeah, you ease my mind" }
    ]
  },
  {
    id: 'yt-ApXoWvfEYVU',
    youtubeId: 'ApXoWvfEYVU',
    source: 'youtube',
    title: 'Sunflower (Spider-Man: Into the Spider-Verse)',
    artist: 'Post Malone & Swae Lee',
    album: 'Spider-Man Soundtrack',
    coverUrl: 'https://i.ytimg.com/vi/ApXoWvfEYVU/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=ApXoWvfEYVU',
    duration: 158,
    genre: 'Hip-Hop',
    bitrate: 'YouTube HQ Stream',
    year: 2018,
    bassLevel: 86,
    plays: 2200000000,
    lyrics: [
      { time: 0, text: "Needless to say, I keep in check" },
      { time: 10, text: "You're a sunflower, I think your love would be too much" }
    ]
  },
  {
    id: 'yt-xpVfcZ0ZcFM',
    youtubeId: 'xpVfcZ0ZcFM',
    source: 'youtube',
    title: "God's Plan",
    artist: 'Drake',
    album: 'Scorpion',
    coverUrl: 'https://i.ytimg.com/vi/xpVfcZ0ZcFM/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=xpVfcZ0ZcFM',
    duration: 199,
    genre: 'Hip-Hop',
    bitrate: 'YouTube HQ Stream',
    year: 2018,
    bassLevel: 94,
    plays: 1600000000,
    lyrics: [
      { time: 0, text: "God's plan, God's plan, I hold back, sometimes I won't" }
    ]
  },
  {
    id: 'yt-YVkUvmDQ3HY',
    youtubeId: 'YVkUvmDQ3HY',
    source: 'youtube',
    title: 'Without Me',
    artist: 'Eminem',
    album: 'The Eminem Show',
    coverUrl: 'https://i.ytimg.com/vi/YVkUvmDQ3HY/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=YVkUvmDQ3HY',
    duration: 298,
    genre: 'Hip-Hop',
    bitrate: 'YouTube HQ Stream',
    year: 2002,
    bassLevel: 90,
    plays: 1900000000,
    lyrics: [
      { time: 0, text: "Now this looks like a job for me, so everybody just follow me" }
    ]
  },

  // 4. Phonk & Drift
  {
    id: 'yt-w-sQRS-Lc9k',
    youtubeId: 'w-sQRS-Lc9k',
    source: 'youtube',
    title: 'Murder In My Mind',
    artist: 'KORDHELL',
    album: 'Phonk Night',
    coverUrl: 'https://i.ytimg.com/vi/w-sQRS-Lc9k/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=w-sQRS-Lc9k',
    duration: 145,
    genre: 'Phonk',
    bitrate: 'YouTube HQ Stream',
    year: 2022,
    bassLevel: 99,
    plays: 350000000,
    lyrics: [
      { time: 0, text: "Heavy 808 cowbell phonk drop" }
    ]
  },
  {
    id: 'yt-lJvRohYSrZM',
    youtubeId: 'lJvRohYSrZM',
    source: 'youtube',
    title: 'METAMORPHOSIS',
    artist: 'INTERWORLD',
    album: 'Metamorphosis',
    coverUrl: 'https://i.ytimg.com/vi/lJvRohYSrZM/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=lJvRohYSrZM',
    duration: 143,
    genre: 'Phonk',
    bitrate: 'YouTube HQ Stream',
    year: 2022,
    bassLevel: 98,
    plays: 280000000,
    lyrics: [
      { time: 0, text: "Aggressive phonk rhythm and cowbell" }
    ]
  },
  {
    id: 'yt-iuJDhFRDx9M',
    youtubeId: 'iuJDhFRDx9M',
    source: 'youtube',
    title: 'Tokyo Drift (Fast & Furious OST)',
    artist: 'Teriyaki Boyz',
    album: 'Tokyo Drift OST',
    coverUrl: 'https://i.ytimg.com/vi/iuJDhFRDx9M/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=iuJDhFRDx9M',
    duration: 255,
    genre: 'Phonk',
    bitrate: 'YouTube HQ Stream',
    year: 2006,
    bassLevel: 97,
    plays: 420000000,
    lyrics: [
      { time: 0, text: "I wonder if you know how they live in Tokyo" },
      { time: 10, text: "Fast and furious, drift, drift, drift" }
    ]
  },

  // 5. EDM & Dance
  {
    id: 'yt-60ItHLz5WEA',
    youtubeId: '60ItHLz5WEA',
    source: 'youtube',
    title: 'Faded',
    artist: 'Alan Walker',
    album: 'Different World',
    coverUrl: 'https://i.ytimg.com/vi/60ItHLz5WEA/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=60ItHLz5WEA',
    duration: 212,
    genre: 'EDM',
    bitrate: 'YouTube HQ Stream',
    year: 2015,
    bassLevel: 90,
    plays: 3600000000,
    lyrics: [
      { time: 0, text: "You were the shadow to my light" },
      { time: 12, text: "Where are you now? Was it all in my fantasy?" }
    ]
  },
  {
    id: 'yt-JRfuAukYTKg',
    youtubeId: 'JRfuAukYTKg',
    source: 'youtube',
    title: 'Titanium',
    artist: 'David Guetta ft. Sia',
    album: 'Nothing But the Beat',
    coverUrl: 'https://i.ytimg.com/vi/JRfuAukYTKg/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=JRfuAukYTKg',
    duration: 245,
    genre: 'EDM',
    bitrate: 'YouTube HQ Stream',
    year: 2011,
    bassLevel: 91,
    plays: 1800000000,
    lyrics: [
      { time: 0, text: "I'm bulletproof, nothing to lose, fire away, fire away" },
      { time: 12, text: "I am titanium" }
    ]
  },
  {
    id: 'yt-gCYcHz2k5x0',
    youtubeId: 'gCYcHz2k5x0',
    source: 'youtube',
    title: 'Animals',
    artist: 'Martin Garrix',
    album: 'Animals',
    coverUrl: 'https://i.ytimg.com/vi/gCYcHz2k5x0/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=gCYcHz2k5x0',
    duration: 192,
    genre: 'EDM',
    bitrate: 'YouTube HQ Stream',
    year: 2013,
    bassLevel: 94,
    plays: 1700000000,
    lyrics: [
      { time: 0, text: "We're the fuckin' animals" }
    ]
  },

  // 6. Rock & Alt
  {
    id: 'yt-eVTXPUF4Oz4',
    youtubeId: 'eVTXPUF4Oz4',
    source: 'youtube',
    title: 'In The End',
    artist: 'Linkin Park',
    album: 'Hybrid Theory',
    coverUrl: 'https://i.ytimg.com/vi/eVTXPUF4Oz4/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=eVTXPUF4Oz4',
    duration: 219,
    genre: 'Rock',
    bitrate: 'YouTube HQ Stream',
    year: 2000,
    bassLevel: 89,
    plays: 1800000000,
    lyrics: [
      { time: 0, text: "It starts with one thing, I don't know why" },
      { time: 10, text: "I tried so hard and got so far, but in the end, it doesn't even matter" }
    ]
  },
  {
    id: 'yt-hTWKbfoikeg',
    youtubeId: 'hTWKbfoikeg',
    source: 'youtube',
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    album: 'Nevermind',
    coverUrl: 'https://i.ytimg.com/vi/hTWKbfoikeg/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=hTWKbfoikeg',
    duration: 278,
    genre: 'Rock',
    bitrate: 'YouTube HQ Stream',
    year: 1991,
    bassLevel: 92,
    plays: 1900000000,
    lyrics: [
      { time: 0, text: "With the lights out, it's less dangerous" },
      { time: 12, text: "Here we are now, entertain us" }
    ]
  },
  {
    id: 'yt-7wtfhZwyrcc',
    youtubeId: '7wtfhZwyrcc',
    source: 'youtube',
    title: 'Believer',
    artist: 'Imagine Dragons',
    album: 'Evolve',
    coverUrl: 'https://i.ytimg.com/vi/7wtfhZwyrcc/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=7wtfhZwyrcc',
    duration: 216,
    genre: 'Rock',
    bitrate: 'YouTube HQ Stream',
    year: 2017,
    bassLevel: 94,
    plays: 2600000000,
    lyrics: [
      { time: 0, text: "Pain! You made me a, you made me a believer, believer" }
    ]
  },
  // 6. Modern Viral Reels & Global Hits
  {
    id: 'yt-eVli-tstM5E',
    youtubeId: 'eVli-tstM5E',
    source: 'youtube',
    title: 'Espresso',
    artist: 'Sabrina Carpenter',
    album: "Short n' Sweet",
    coverUrl: 'https://i.ytimg.com/vi/eVli-tstM5E/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=eVli-tstM5E',
    duration: 175,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2024,
    bassLevel: 88,
    plays: 1450000000,
    lyrics: [
      { time: 0, text: "Now he's thinkin' 'bout me every night, oh" },
      { time: 8, text: "Is it that sweet? I guess so" },
      { time: 14, text: "Say you can't sleep, baby, I know" },
      { time: 20, text: "That's that me, espresso" }
    ]
  },
  {
    id: 'yt-V9PVRfjEBTI',
    youtubeId: 'V9PVRfjEBTI',
    source: 'youtube',
    title: 'BIRDS OF A FEATHER',
    artist: 'Billie Eilish',
    album: 'HIT ME HARD AND SOFT',
    coverUrl: 'https://i.ytimg.com/vi/V9PVRfjEBTI/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=V9PVRfjEBTI',
    duration: 196,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2024,
    bassLevel: 82,
    plays: 1320000000,
    lyrics: [
      { time: 0, text: "Birds of a feather, we should stick together, I know" },
      { time: 8, text: "I said I'd never think I wasn't better alone" },
      { time: 16, text: "Can't change the weather, might not be forever" },
      { time: 24, text: "But if it's forever, it's even better" }
    ]
  },
  {
    id: 'yt-x1-g7Z0yrIk',
    youtubeId: 'x1-g7Z0yrIk',
    source: 'youtube',
    title: 'Tauba Tauba',
    artist: 'Karan Aujla',
    album: 'Bad Newz',
    coverUrl: 'https://i.ytimg.com/vi/x1-g7Z0yrIk/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=x1-g7Z0yrIk',
    duration: 208,
    genre: 'Desi',
    bitrate: 'YouTube HQ Stream',
    year: 2024,
    bassLevel: 94,
    plays: 890000000,
    lyrics: [
      { time: 0, text: "Husn tera tauba tauba, nakhra tera tauba tauba" },
      { time: 10, text: "Oh tauba tauba, oh tauba tauba" },
      { time: 20, text: "Tere agge piche aave munde line'an maar ke" }
    ]
  },
  {
    id: 'yt-a3Ue-LN5B9U',
    youtubeId: 'a3Ue-LN5B9U',
    source: 'youtube',
    title: 'Aasa Kooda',
    artist: 'Sai Abhyankkar',
    album: 'Think Indie',
    coverUrl: 'https://i.ytimg.com/vi/a3Ue-LN5B9U/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=a3Ue-LN5B9U',
    duration: 198,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2024,
    bassLevel: 90,
    plays: 450000000,
    lyrics: [
      { time: 0, text: "Aasa kooda vaazha venum un kooda" },
      { time: 8, text: "Kaalam poora neeye venum en thoda" }
    ]
  },
  {
    id: 'yt-WcIcVapfqXw',
    youtubeId: 'WcIcVapfqXw',
    source: 'youtube',
    title: 'Calm Down',
    artist: 'Rema & Selena Gomez',
    album: 'Rave & Climax',
    coverUrl: 'https://i.ytimg.com/vi/WcIcVapfqXw/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=WcIcVapfqXw',
    duration: 239,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2022,
    bassLevel: 91,
    plays: 1200000000,
    lyrics: [
      { time: 0, text: "Baby, calm down, calm down" },
      { time: 6, text: "Girl, this your body e put my heart for lockdown" },
      { time: 12, text: "For lockdown, oh, lockdown" }
    ]
  },
  {
    id: 'yt-6swmTBVI83k',
    youtubeId: '6swmTBVI83k',
    source: 'youtube',
    title: 'INDUSTRY BABY',
    artist: 'Lil Nas X & Jack Harlow',
    album: 'MONTERO',
    coverUrl: 'https://i.ytimg.com/vi/6swmTBVI83k/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=6swmTBVI83k',
    duration: 212,
    genre: 'Hip-Hop',
    bitrate: 'YouTube HQ Stream',
    year: 2021,
    bassLevel: 95,
    plays: 2100000000,
    lyrics: [
      { time: 0, text: "Baby back, ayy, couple racks, ayy" },
      { time: 6, text: "Couple feature, ayy, on the map, ayy" },
      { time: 12, text: "And this one is for the champions" }
    ]
  },
  {
    id: 'yt-B9synWjqBn8',
    youtubeId: 'B9synWjqBn8',
    source: 'youtube',
    title: 'FE!N',
    artist: 'Travis Scott ft. Playboi Carti',
    album: 'UTOPIA',
    coverUrl: 'https://i.ytimg.com/vi/B9synWjqBn8/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=B9synWjqBn8',
    duration: 191,
    genre: 'Hip-Hop',
    bitrate: 'YouTube HQ Stream',
    year: 2023,
    bassLevel: 98,
    plays: 950000000,
    lyrics: [
      { time: 0, text: "FE!N, FE!N, FE!N, FE!N, FE!N" },
      { time: 8, text: "The career's more at stake when you in your prime" }
    ]
  },
  {
    id: 'yt-kPa7bsKwL-c',
    youtubeId: 'kPa7bsKwL-c',
    source: 'youtube',
    title: 'Die With A Smile',
    artist: 'Lady Gaga & Bruno Mars',
    album: 'Die With A Smile',
    coverUrl: 'https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=kPa7bsKwL-c',
    duration: 251,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2024,
    bassLevel: 86,
    plays: 870000000,
    lyrics: [
      { time: 0, text: "If the world was ending, I'd wanna be next to you" },
      { time: 10, text: "If the party was over and our time on Earth was through" },
      { time: 20, text: "I'd wanna hold you just for a while and die with a smile" }
    ]
  },
  {
    id: 'yt-H58vbez_m4E',
    youtubeId: 'H58vbez_m4E',
    source: 'youtube',
    title: 'Not Like Us',
    artist: 'Kendrick Lamar',
    album: 'Not Like Us',
    coverUrl: 'https://i.ytimg.com/vi/H58vbez_m4E/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=H58vbez_m4E',
    duration: 274,
    genre: 'Hip-Hop',
    bitrate: 'YouTube HQ Stream',
    year: 2024,
    bassLevel: 96,
    plays: 1300000000,
    lyrics: [
      { time: 0, text: "Mustard on the beat, ho" },
      { time: 6, text: "They not like us, they not like us, they not like us" }
    ]
  },
  {
    id: 'yt-TVEuKyr0M58',
    youtubeId: 'TVEuKyr0M58',
    source: 'youtube',
    title: 'Gata Only',
    artist: 'FloyyMenor & Cris Mj',
    album: 'Gata Only',
    coverUrl: 'https://i.ytimg.com/vi/TVEuKyr0M58/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=TVEuKyr0M58',
    duration: 222,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2024,
    bassLevel: 92,
    plays: 1100000000,
    lyrics: [
      { time: 0, text: "Te quedas sola o te vienes conmigo" }
    ]
  },
  {
    id: 'yt-XoiOOiuH8iI',
    youtubeId: 'XoiOOiuH8iI',
    source: 'youtube',
    title: 'Water',
    artist: 'Tyla',
    album: 'TYLA',
    coverUrl: 'https://i.ytimg.com/vi/XoiOOiuH8iI/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=XoiOOiuH8iI',
    duration: 200,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2023,
    bassLevel: 90,
    plays: 850000000,
    lyrics: [
      { time: 0, text: "Make me sweat, make me hotter" },
      { time: 6, text: "Make me lose my breath, make me water" }
    ]
  },
  {
    id: 'yt-toea_w8kK2M',
    youtubeId: 'toea_w8kK2M',
    source: 'youtube',
    title: 'greedy',
    artist: 'Tate McRae',
    album: 'THINK LATER',
    coverUrl: 'https://i.ytimg.com/vi/toea_w8kK2M/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=toea_w8kK2M',
    duration: 131,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2023,
    bassLevel: 92,
    plays: 1150000000,
    lyrics: [
      { time: 0, text: "I would want myself, baby, please believe me" },
      { time: 8, text: "I'll put you through hell just to know me, yeah, yeah" }
    ]
  },
  {
    id: 'yt-VAdGW7QDJUI',
    youtubeId: 'VAdGW7QDJUI',
    source: 'youtube',
    title: 'Chaleya',
    artist: 'Arijit Singh & Shilpa Rao',
    album: 'Jawan',
    coverUrl: 'https://i.ytimg.com/vi/VAdGW7QDJUI/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=VAdGW7QDJUI',
    duration: 200,
    genre: 'Desi',
    bitrate: 'YouTube HQ Stream',
    year: 2023,
    bassLevel: 87,
    plays: 750000000,
    lyrics: [
      { time: 0, text: "Ishq mein dil bana hai, ishq mein dil fanaa hai" },
      { time: 10, text: "Teri chahat mein main chaleya, main chaleya" }
    ]
  },
  {
    id: 'yt-ElZfdU54Cp8',
    youtubeId: 'ElZfdU54Cp8',
    source: 'youtube',
    title: 'Apna Bana Le',
    artist: 'Arijit Singh',
    album: 'Bhediya',
    coverUrl: 'https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=ElZfdU54Cp8',
    duration: 261,
    genre: 'Desi',
    bitrate: 'YouTube HQ Stream',
    year: 2022,
    bassLevel: 85,
    plays: 820000000,
    lyrics: [
      { time: 0, text: "Apna bana le piya, apna bana le piya" },
      { time: 12, text: "Dil ke nagar mein shehar tu basa le piya" }
    ]
  },
  {
    id: 'yt-0U_S310YhD8',
    youtubeId: '0U_S310YhD8',
    source: 'youtube',
    title: 'Elevated',
    artist: 'Shubh',
    album: 'Elevated',
    coverUrl: 'https://i.ytimg.com/vi/0U_S310YhD8/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=0U_S310YhD8',
    duration: 200,
    genre: 'Desi',
    bitrate: 'YouTube HQ Stream',
    year: 2022,
    bassLevel: 94,
    plays: 620000000,
    lyrics: [
      { time: 0, text: "Gaddi kaali dooron jaandi labhdi" }
    ]
  },
  {
    id: 'yt-2yS_803nQ1k',
    youtubeId: '2yS_803nQ1k',
    source: 'youtube',
    title: 'No Love',
    artist: 'Shubh',
    album: 'No Love',
    coverUrl: 'https://i.ytimg.com/vi/2yS_803nQ1k/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=2yS_803nQ1k',
    duration: 170,
    genre: 'Desi',
    bitrate: 'YouTube HQ Stream',
    year: 2022,
    bassLevel: 93,
    plays: 580000000,
    lyrics: [
      { time: 0, text: "Bhavein lakh vaari karr jhoothe vaade soniye" }
    ]
  },
  {
    id: 'yt-vsWxs1tuwDk',
    youtubeId: 'vsWxs1tuwDk',
    source: 'youtube',
    title: 'Winning Speech',
    artist: 'Karan Aujla',
    album: 'Winning Speech',
    coverUrl: 'https://i.ytimg.com/vi/vsWxs1tuwDk/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=vsWxs1tuwDk',
    duration: 215,
    genre: 'Desi',
    bitrate: 'YouTube HQ Stream',
    year: 2024,
    bassLevel: 96,
    plays: 430000000,
    lyrics: [
      { time: 0, text: "Winning speech likhi baitha jatt ni" }
    ]
  },
  {
    id: 'yt-cWMxCE2HTag',
    youtubeId: 'cWMxCE2HTag',
    source: 'youtube',
    title: 'Softly',
    artist: 'Karan Aujla',
    album: 'Making Memories',
    coverUrl: 'https://i.ytimg.com/vi/cWMxCE2HTag/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=cWMxCE2HTag',
    duration: 155,
    genre: 'Desi',
    bitrate: 'YouTube HQ Stream',
    year: 2023,
    bassLevel: 94,
    plays: 510000000,
    lyrics: [
      { time: 0, text: "Pyaar naal samjhaawan tenu softly" }
    ]
  },
  {
    id: 'yt-vX2cDW8LUWk',
    youtubeId: 'vX2cDW8LUWk',
    source: 'youtube',
    title: 'Excuses',
    artist: 'AP Dhillon & Gurinder Gill',
    album: 'Hidden Gems',
    coverUrl: 'https://i.ytimg.com/vi/vX2cDW8LUWk/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=vX2cDW8LUWk',
    duration: 176,
    genre: 'Desi',
    bitrate: 'YouTube HQ Stream',
    year: 2020,
    bassLevel: 91,
    plays: 780000000,
    lyrics: [
      { time: 0, text: "Kehndi hundi si chan tak raah bana de" },
      { time: 8, text: "Taare ne pasand mainu hethaan saare laa de" }
    ]
  },
  {
    id: 'yt-dJM5DN1mMls',
    youtubeId: 'dJM5DN1mMls',
    source: 'youtube',
    title: 'Montagem Mysterious Game',
    artist: 'LXNGVX',
    album: 'Phonk Supercharged',
    coverUrl: 'https://i.ytimg.com/vi/dJM5DN1mMls/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=dJM5DN1mMls',
    duration: 135,
    genre: 'Phonk',
    bitrate: 'YouTube HQ Stream',
    year: 2024,
    bassLevel: 99,
    plays: 350000000,
    lyrics: [
      { time: 0, text: "Heavy bass phonk rhythm drop" }
    ]
  },
  {
    id: 'yt-mRD0-GxqHVo',
    youtubeId: 'mRD0-GxqHVo',
    source: 'youtube',
    title: 'Heat Waves',
    artist: 'Glass Animals',
    album: 'Dreamland',
    coverUrl: 'https://i.ytimg.com/vi/mRD0-GxqHVo/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=mRD0-GxqHVo',
    duration: 238,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2020,
    bassLevel: 89,
    plays: 2800000000,
    lyrics: [
      { time: 0, text: "Sometimes, all I think about is you" },
      { time: 8, text: "Late nights in the middle of June" }
    ]
  },
  {
    id: 'yt-kTJczUoc26U',
    youtubeId: 'kTJczUoc26U',
    source: 'youtube',
    title: 'STAY',
    artist: 'The Kid LAROI & Justin Bieber',
    album: 'F*CK LOVE 3',
    coverUrl: 'https://i.ytimg.com/vi/kTJczUoc26U/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=kTJczUoc26U',
    duration: 141,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2021,
    bassLevel: 88,
    plays: 3100000000,
    lyrics: [
      { time: 0, text: "I do the same thing I told you that I never would" },
      { time: 6, text: "I told you I'd change, even when I knew I never could" }
    ]
  },
  {
    id: 'yt-XXYlFuWEuKI',
    youtubeId: 'XXYlFuWEuKI',
    source: 'youtube',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    coverUrl: 'https://i.ytimg.com/vi/XXYlFuWEuKI/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=XXYlFuWEuKI',
    duration: 215,
    genre: 'Pop',
    bitrate: 'YouTube HQ Stream',
    year: 2020,
    bassLevel: 89,
    plays: 2500000000,
    lyrics: [
      { time: 0, text: "I saw you dancing in a crowded room" },
      { time: 8, text: "You look so happy when I'm not with you" },
      { time: 16, text: "Save your tears for another day" }
    ]
  },
  {
    id: 'yt-D9G1VOjN_84',
    youtubeId: 'D9G1VOjN_84',
    source: 'youtube',
    title: 'Enemy',
    artist: 'Imagine Dragons x J.I.D',
    album: 'Arcane League of Legends',
    coverUrl: 'https://i.ytimg.com/vi/D9G1VOjN_84/hqdefault.jpg',
    audioUrl: 'https://www.youtube.com/watch?v=D9G1VOjN_84',
    duration: 173,
    genre: 'Rock',
    bitrate: 'YouTube HQ Stream',
    year: 2021,
    bassLevel: 93,
    plays: 1800000000,
    lyrics: [
      { time: 0, text: "Oh, the misery, everybody wants to be my enemy" }
    ]
  }
];

export const FEATURED_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-yt-top',
    name: 'Global Top 50 Hits',
    description: 'Starboy, Blinding Lights, Shape of You, and Levitating in full length.',
    coverUrl: 'https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg',
    trackIds: ['yt-34Na4j8AVgA', 'yt-4NRXx6U8ABQ', 'yt-TUVcZfQe-Kw', 'yt-DyDfgMOUjCI', 'yt-JGwWNGJdvx8'],
    color: '#FF0000'
  },
  {
    id: 'pl-desi-hits',
    name: 'Desi Punjabi Chartbusters',
    description: 'Brown Munde, Kesariya, 295, Pasoori, Cheques & Lover.',
    coverUrl: 'https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg',
    trackIds: ['yt-VNs_cCtdbPc', 'yt-BddP6PYo2gs', 'yt-n_FCrCQ6-bA', 'yt-5Eqb_-j3FDA', 'yt-4tywp83zkmk'],
    color: '#FF5500'
  },
  {
    id: 'pl-bass-boosted',
    name: 'Heavy 808 Trap & Phonk',
    description: 'SICKO MODE, goosebumps, Murder In My Mind, and Tokyo Drift.',
    coverUrl: 'https://i.ytimg.com/vi/6ONRf7h3Mdk/hqdefault.jpg',
    trackIds: ['yt-6ONRf7h3Mdk', 'yt-Dst9gZkq1a8', 'yt-w-sQRS-Lc9k', 'yt-lJvRohYSrZM', 'yt-iuJDhFRDx9M'],
    color: '#0066FF'
  },
  {
    id: 'pl-rock-legends',
    name: 'Rock & EDM Anthems',
    description: 'In The End, Believer, Faded, Animals, and Smells Like Teen Spirit.',
    coverUrl: 'https://i.ytimg.com/vi/eVTXPUF4Oz4/hqdefault.jpg',
    trackIds: ['yt-eVTXPUF4Oz4', 'yt-7wtfhZwyrcc', 'yt-60ItHLz5WEA', 'yt-hTWKbfoikeg', 'yt-gCYcHz2k5x0'],
    color: '#10B981'
  }
];

export const GENRES = [
  { id: 'all', name: 'All' },
  { id: 'youtube', name: 'Trending Charts' },
  { id: 'desi', name: 'Desi' },
  { id: 'pop', name: 'Pop' },
  { id: 'hiphop', name: 'Hip-Hop' },
  { id: 'phonk', name: 'Phonk' },
  { id: 'edm', name: 'EDM' },
  { id: 'rock', name: 'Rock' }
];

/**
 * Universal Music Search Service
 * Searches both local high-definition catalog AND live YouTube Music
 * so users can find and stream virtually ANY real song from YouTube on Earth!
 */
export async function searchUniversalMusic(query: string): Promise<Track[]> {
  const clean = query.trim().toLowerCase();
  if (!clean) return CURATED_TRACKS;

  // 1. Local matches
  const localMatches = CURATED_TRACKS.filter(
    (t) =>
      t.title.toLowerCase().includes(clean) ||
      t.artist.toLowerCase().includes(clean) ||
      t.album.toLowerCase().includes(clean) ||
      t.genre.toLowerCase().includes(clean)
  );

  // 2. Query YouTube Live Search API endpoint via centralized YouTubeSearchService
  try {
    const ytTracks = await youtubeSearchService.search(query);
    if (Array.isArray(ytTracks) && ytTracks.length > 0) {
      const combined = [...localMatches];
      for (const yt of ytTracks) {
        if (!combined.some((t) => (t.youtubeId && t.youtubeId === yt.youtubeId) || t.title.toLowerCase() === yt.title.toLowerCase())) {
          combined.push(yt);
        }
      }
      return combined;
    }
  } catch (err) {
    console.warn('YouTube search API note:', err);
  }

  // 3. Fallback to iTunes API if needed
  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=20`
    );

    if (response.ok) {
      const data = await response.json();
      if (data.results && Array.isArray(data.results)) {
        const onlineTracks: Track[] = data.results
          .filter((item: any) => item.previewUrl)
          .map((item: any) => ({
            id: `online-${item.trackId}`,
            title: item.trackName || 'Unknown Title',
            artist: item.artistName || 'Unknown Artist',
            album: item.collectionName || item.trackName,
            coverUrl: (item.artworkUrl100 || '').replace('100x100bb.jpg', '600x600bb.jpg'),
            audioUrl: item.previewUrl,
            duration: Math.round((item.trackTimeMillis || 30000) / 1000),
            genre: item.primaryGenreName || 'Pop',
            bitrate: '320 kbps',
            year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : 2024,
            bassLevel: 85,
            plays: Math.floor(Math.random() * 800000) + 200000,
          }));

        const combined = [...localMatches];
        for (const ot of onlineTracks) {
          if (!combined.some((t) => t.id === ot.id || t.title.toLowerCase() === ot.title.toLowerCase())) {
            combined.push(ot);
          }
        }
        return combined;
      }
    }
  } catch (err) {
    console.warn('Fallback search note:', err);
  }

  return localMatches;
}
