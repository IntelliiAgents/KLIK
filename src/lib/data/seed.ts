import {
  Festival,
  FestivalEdition,
  VenueLocation,
  Artist,
  FestivalEvent,
  Challenge,
  FestivalNotice,
} from "../types";

export interface FestivalPartner {
  name: string;
  role: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export interface OfficialPoster {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  downloadName: string;
  aspectRatio: "portrait" | "a4";
}

export const ABOUT_KLIK_2026 = {
  heading: "About Kleinmond inniebos Kunstefees 2026",
  paragraphs: [
    "The Kleinmond inniebos Kunstefees (KliK) is a vibrant celebration where creative expression and community spirit intertwine on the Overberg coast. Built on a foundation of collaboration, KliK is brought to life through the shared vision of its partners. This spirit of cooperation underpins the festival, welcoming audiences from all walks of life while bridging diverse voices and traditions.",
    "From grassroots talent and youth showcases to acclaimed poets, writers, and musicians, it offers an open space where every story finds a home.",
    "For art lovers, KliK delivers a programme designed to spark curiosity and connection. Attendees can dive into intimate author discussions, writing workshops, spoken word, visual art, live music, take a coastal walk and browse the KliK Market.",
    "Setting the experience apart is Kleinmond itself, nestled between fynbos-clad mountains and the Atlantic Ocean. Between shows, festival-goers can take a beach walk toward the lagoon, or unwind at cosy local cafés. KliK is more than a cultural showcase - it is a soulful coastal getaway where art, nature, and community partnerships meet.",
  ],
};

export const YOUTH_PROGRAMME_INFO = {
  title: "Children & Youth Programme",
  homeHeading: "Children & Youth at KliK",
  homeCopy:
    "Discover a world of creativity! Storytelling, visual art, poetry, drama, jazz and hip hop activities for young festival-goers.",
  date: "2026-11-28",
  dateDisplay: "Saturday, 28 November 2026",
  dateShort: "Saturday, 28 November",
  timeRange: "10:00–14:00",
  venueId: "loc-mthimkhulu",
  venueName: "Mthimkhulu Village Centre",
  venueFull: "Mthimkhulu Village Centre / Mthimkhulu Community Development, 9th Avenue, Kleinmond",
  admission: "Free Zone",
  lunchBreak: {
    startTime: "12:00",
    endTime: "12:45",
    title: "Lunch Break",
  },
  draftNotice:
    "Draft programme — details and session times remain subject to change.",
};

export const OFFICIAL_POSTERS: OfficialPoster[] = [
  {
    id: "poster-programme-1",
    title: "Festival Programme — Page 1",
    subtitle: "Friday 27 Nov & Saturday 28 Nov",
    imageUrl: "/assets/programme-poster-page-1.png",
    downloadName: "KliK-2026-Programme-Page-1.png",
    aspectRatio: "a4",
  },
  {
    id: "poster-programme-2",
    title: "Festival Programme — Page 2",
    subtitle: "Saturday 28 Nov (Cont.) & Sunday 29 Nov",
    imageUrl: "/assets/programme-poster-page-2.png",
    downloadName: "KliK-2026-Programme-Page-2.png",
    aspectRatio: "a4",
  },
  {
    id: "poster-overview",
    title: "KliK 2026 Festival Poster",
    subtitle: "Featured Artists & Festival Highlights",
    imageUrl: "/assets/poster.jpg",
    downloadName: "KliK-2026-Official-Poster.jpg",
    aspectRatio: "portrait",
  },
  {
    id: "poster-youth",
    title: "Youth Festival & Talent Poster",
    subtitle: "Workshops & Kleinmond Has Talent",
    imageUrl: "/assets/youth-poster.jpg",
    downloadName: "KliK-2026-Youth-Festival-Poster.jpg",
    aspectRatio: "portrait",
  },
];

export const SEED_FESTIVAL: Festival = {
  id: "klik-festival",
  name: "Kleinmond inniebos Kunstefees",
  shortName: "KliK 2026",
  tagline: "Meet the writers. Follow the music. Make room for art.",
  description: ABOUT_KLIK_2026.paragraphs[0],
  quicketUrl:
    "https://www.quicket.co.za/events/339579-kleinmond-inniebos-kunstefees-klik/",
};

export const SEED_EDITION: FestivalEdition = {
  id: "klik-2026",
  festivalId: "klik-festival",
  editionYear: 2026,
  startDate: "2026-11-27",
  endDate: "2026-11-29",
  locationName: "Kleinmond, Western Cape",
  status: "published",
};

export const SEED_PARTNERS: FestivalPartner[] = [
  {
    name: "Overstrand Municipality",
    role: "Civic & Municipal Partner",
    logoUrl: "/assets/partners/overstrand-municipality.jpg",
  },
  {
    name: "Hangklip-Kleinmond Tourism Bureau",
    role: "Official Tourism & Destination Partner",
    logoUrl: "/assets/partners/hangklip-kleinmond-tourism.png",
  },
  {
    name: "The Grail Centre",
    role: "Venue & Cultural Partner",
    logoUrl: "/assets/partners/the-grail-centre.jpg",
  },
  {
    name: "Mthimkhulu Community Development",
    role: "Community & Youth Development Partner",
    logoUrl: "/assets/partners/mthimkhulu.jpg",
  },
  {
    name: "Kleinmond Central Café",
    role: "Venue & Hospitality Partner",
    logoUrl: "/assets/partners/central-cafe.jpg",
  },
  {
    name: "Tides Restaurant & Beach Bar",
    role: "Harbour Venue & Hospitality Partner",
    logoUrl: "/assets/partners/tides.jpg",
  },
  {
    name: "CACNET",
    role: "Community Arts Centres Network Western Cape",
    logoUrl: "/assets/partners/cacnet.jpg",
  },
  {
    name: "Catalyst Press",
    role: "Literary & Publishing Partner",
    logoUrl: "/assets/partners/catalyst-press.jpg",
  },
  {
    name: "Modjadji Books",
    role: "Literary & Publishing Partner",
    logoUrl: "/assets/partners/modjadji-books.jpg",
  },
  {
    name: "Cape Cultural Collective",
    role: "Cultural & Arts Partner",
    logoUrl: "/assets/partners/cape-cultural-collective.jpg",
  },
  {
    name: "Hangklip-Kleinmond Business Forum",
    role: "Business & Community Partner",
    logoUrl: "/assets/partners/hangklip-kleinmond-business-forum.jpg",
  },
  {
    name: "Overstrand Herald",
    role: "Official Media Partner",
    logoUrl: "/assets/partners/overstrand-herald.jpg",
  },
  {
    name: "PostLink Kleinmond",
    role: "Official Print Partner",
    logoUrl: "/assets/partners/postlink.jpg",
  },
  {
    name: "African Gypsy",
    role: "Artisanal & Craft Partner",
    logoUrl: "/assets/partners/african-gypsy.jpg",
  },
  {
    name: "Cape Winelands Hip Hop Dance Academy",
    role: "Youth Performance & Dance Partner",
    logoUrl: "/assets/partners/cape-winelands-hip-hop.jpg",
  },
];

// Held for organiser confirmation (present in Artist Profiles Draft 4, no confirmed programme session yet):
export const UNCONFIRMED_ARTISTS_HELD_FOR_REVIEW: Artist[] = [
  {
    id: "art-babalwa-meintjies",
    name: "Babalwa Meintjies",
    discipline: "Jazz Vocalist, Composer & Music Educator",
    bio: "Babalwa Meintjies is a talented South African jazz vocalist, composer, and music educator from Makhanda. With a qualification in Jazz Performance and a background in Marketing Management from the University of KwaZulu-Natal, she seamlessly blends artistic passion with business skills. As a vocal coach, community mentor, and Project Manager at IMAD, she champions indigenous arts and youth empowerment. Founder of Amathunzi Arts & Development Centre, she uses arts for social change. Recognized with awards for an Influential Woman of 2024 and a Good Hope FM Warrior Woman 2025, Babalwa has performed with top jazz artists nationally and internationally. Her soulful voice and expressive stage presence inspire audiences and elevate the jazz scene, making her a pivotal figure in South Africa's cultural landscape.",
  },
];

export const SEED_ARTISTS: Artist[] = [
  {
    id: "art-mengelmoesdigters",
    name: "Mengelmoesdigters",
    discipline: "Poetry & Literary Collective",
    bio: `The Mengelmoesdigters are a collective of passionate poets and writers dedicated to inspiring, connecting, and empowering people through poetry, storytelling, and creative writing. Mentored by renowned South African poet Diana Ferrus since 2013, the group has grown into a vibrant literary collective that celebrates diverse voices, cultures, and lived experiences through both the written and spoken word. The Mengelmoesdigters have performed at prominent literary and cultural events, including the Stellenbosch Woordfees, Adam Small Festival, Tuin van Digters, and the McGregor Poetry Festival. Performing in both Afrikaans and English, the group connects with diverse audiences and creates meaningful spaces for dialogue, reflection, and creative expression.

The Mengelmoesdigters encourage people of all ages to explore their imagination, share their stories, and discover the power of their own voices. Through creative writing, poetry, storytelling, workshops, and performances, participants are inspired to build confidence, strengthen communication skills, and express themselves in authentic and meaningful ways. Committed to promoting literacy, creativity, cultural appreciation, and community engagement, the Mengelmoesdigters collaborate with schools, libraries, community organisations, festivals, and youth groups.

The group has self-published three collaborative poetry collections: Die Mengelmoesdigters: 'n Versameling Gedigte (2020), In Woorde Gebaar (2023), and Waar Grense Bloei (2025), alongside several other collaborative anthologies. Their motto is: # Saam skryf is oopskryf, is vryskryf.`,
  },
  {
    id: "art-merle-danhouse",
    name: "Merle Danhouse",
    discipline: "Poet, Writer & Facilitator (Mengelmoesdigters)",
    bio: `Merle Danhouse is a poet, social worker, researcher, and writer whose work is rooted in storytelling, healing, and the lived experiences of families and communities. She is a member of the Mengelmoesdigters, where she participates in poetry performances, literary events, and community creative writing initiatives. Her debut poetry collection, Die Broodjie, was published in 2019.

In addition to her poetry collection, her work has appeared on LitNet, and one of her Hartstories was published in Kuier magazine. Her writing explores themes of identity, resilience, memory, belonging, and family connectedness, drawing on both personal experience and her professional background as a social worker. As a creative writing facilitator, Merle is passionate about encouraging people of all ages to discover their unique voices through poetry, storytelling, and narrative. She believes that every story has value and strives to create welcoming spaces where creativity can flourish, confidence can grow, and stories can be shared with authenticity and purpose.`,
  },
  {
    id: "art-theresa-carstens",
    name: "Theresa Carstens",
    discipline: "Poet & Founding Member (Mengelmoesdigters)",
    bio: `Theresa Carstens is a poet from Wellington in the Boland whose writing is inspired by her life experiences and the transformative power of poetry. She is a founding member of the Mengelmoesdigters and has been mentored by renowned South African poet Diana Ferrus since the group's inception. Theresa has performed at numerous literary and cultural festivals, including the Stellenbosch Woordfees, Adam Small Festival, Tuin van Digters, McGregor Poetry Festival, and events hosted by the Koena Art Institute. Her poetry has appeared in several collaborative anthologies, including 7de Reënboog, Die Mengelmoesdigters: 'n Versameling Gedigte (2020), Hier's my Hart Pa, McGregor Anthology (2021), Nuwe Era Groot Verseboek (2023), In Woorde Gebaar (2023), Ons Kom van Hier (2025) and Waar Grense Bloei (2025).

In 2023, Theresa received the Patricia Schonstein Poetry in McGregor Award in recognition of her outstanding poetry. She launched her debut poetry collection, Ghost Town, in 2024.`,
  },
  {
    id: "art-fiona-fertyn",
    name: "Fiona Fertyn",
    discipline: "Poet & Educator (Mengelmoesdigters)",
    bio: `Fiona Fertyn is originally from Paarl and has been actively involved with the Mengelmoesdigters for many years. She previously served as a Creative Support Teacher at Paarlzicht Primary School, where she assisted learners with creative writing and poetry. She has performed at several literary festivals, including Tuin van Digters, Stellenbosch Woordfees, Poetry in McGregor, and the Adam Small Festival. She has also published her own poetry collection, Paarl Skatkis van Gedagtes (2014).`,
  },
  {
    id: "art-gaireyah-fredericks",
    name: "Gaireyah Fredericks",
    discipline: "Poet, Author & Language Activist (Mengelmoesdigters)",
    bio: `Gaireyah Fredericks is an award-winning poet, author, translator, and language activist from Paarl. A passionate advocate for Kaaps and Afrikaans, her work celebrates identity, culture, community, and the richness of language. Her poetry has been featured at numerous literary festivals and cultural events across South Africa. She is the author of 13 self-published poetry collections, two of which were simultaneously nominated for the prestigious Eugene Marais Literary Prize. Her acclaimed debut collection, Een voet innie kabr (2024), earned both the Eugene Marais Literary Prize from the South African Academy for Science and Arts and the UJ Debut Literary Prize from the University of Johannesburg. Her many accolades include the Patricia Schonstein Poetry in McGregor Award (2016), the Hugh Hodges 'On the Spot' Award, the Neville Alexander Prestige Award for promoting social cohesion and nation-building through Afrikaans, the Diana Ferrus Prize for Literature, and recognition from the Wellington Station Festival and the McGregor Poetry Festival for her dedication to Kaaps, poetry, and youth mentorship.

Gaireyah holds an Honours degree in Afrikaans from the University of the Western Cape and an MA from Rhodes University. She is a script consultant and writer for the television drama Suidooster and collaborates with the Centre for Multilingualism and Diversities Research (CMDR) at the University of the Western Cape, where she translates curriculum material into Kaaps for the Western Cape Education Department. Deeply committed to developing emerging writers, Gaireyah continues to mentor young poets and create opportunities for them to share their work on public platforms. Through her writing, advocacy, and mentorship, she remains a powerful voice for language, creativity, and cultural expression in South Africa.`,
  },
  {
    id: "art-sophia-olifant",
    name: "Sophia Olifant",
    discipline: "Poet & Performer (Mengelmoesdigters)",
    bio: `Sophia Olifant is a vital component of the collaborative spirit that defines the Mengelmoesdigters. Her performances and writings centre heavily on the overarching themes of the collective: a metaphorical journey through day-to-day human experiences, a confrontation with identity in a changing society, and the reclamation of historical memory. Olifant has been a core member of the ensemble's flagship curated festival productions, including the highly popular interactive session "An Interplay of Thoughts & Emotions". Alongside her peers, she has spent over a decade taking public stages across the Western Cape, from Wellington to McGregor, to keep the oral and written tradition of community poetry thriving.`,
  },
  {
    id: "art-frazer-barry",
    name: "Frazer Barry",
    discipline: "Musician, Composer & Cultural Mentor",
    bio: `Born and raised in Kleinmond, Frazer has spent over 25 years captivating audiences nationally and internationally with his authentically South African sound. His diverse career spans community organisations, local government, television, radio, and the creative arts.

He has a deep affinity for South African folk music, particularly lyrics that speak to the nation's heart. His work explores themes from protest to the upbeat traditional sounds of the Boland, including Riel and Kaapse styles. He regularly composes for short films, TV series, documentaries, and adverts. His collaborations are equally impressive, having set the work of prominent South African poets to music and partnered with Poet Laureates from Belgium and the Netherlands. This border-crossing work was honoured with the 2023 Toyota US Woordfees 'In Verbondenheid' Award.

As a musical director, musician, actor, or presenter, his excellence has been recognised with a Cannes award and accolades from the Kyknet Fiëstas, Fleur du Cap, Woordfees, Silwerskerm, and Blinkers festivals. For 21 years, he has been the lead vocalist of Tribal Echo Orkes and is currently working on a solo album. A multi-instrumentalist, Frazer also designs and crafts unique traditional instruments. Beyond his professional career, he is deeply committed to community development, acknowledged by the 2019 Overstrand Mayor's Award. He actively gives back through mentorship and championing arts, culture, and the Afrikaans language, for which he received the 2020 Cordis Trust 'Orde van die Beiteltjie' Award. He is a familiar face as the presenter of KykNet's Fiësta (2015–2024) and Ommighellie (2022–2023), and RSG's Rymklets Sonder Grense (2022–2024), and is a 2025 founder member and mentor for the Kleinmond Arts & Culture Centre.`,
  },
  {
    id: "art-khadija-heeger",
    name: "Khadija Heeger",
    discipline: "Poet, Performer & Storyteller",
    bio: `Khadija Tracy Heeger is a dynamic poet, performer, and storyteller from Cape Town, South Africa. Her work, deeply rooted in the city's multicultural heritage, explores themes of identity, history, and social justice. Heeger's poetry blends personal narrative with broader socio-political reflections, drawing on her Cape Malay roots and lived experiences in post-apartheid South Africa. Known for her powerful stage presence and evocative performances, she has participated in various literary festivals and cultural events. Heeger's work often addresses marginalised voices, celebrating resilience and community while challenging social inequities through lyrical expression. Her publications include Beyond the Delivery Room (2013) and Thicker than Sorrow (2023).`,
  },
  {
    id: "art-philip-balie",
    name: "Philip Balie",
    discipline: "Heritage Walking Guide",
    bio: "Respected Kleinmond resident, conservationist, and local walking guide leading the See en Fynbos Paradys shoreline journey.",
  },
  {
    id: "art-marching-band",
    name: "Kleinmond Marching Band",
    discipline: "Community Brass & Percussion Ensemble",
    bio: `The Kleinmond Marching Band was established in 2025 as part of the Kleinmond Arts & Culture Hub initiatives, with the vision of creating opportunities for musical development, creativity, and community participation. The band brings together a dynamic mix of upcoming and professional musicians, teenagers, and adults, united by their passion for music, performance, and cultural expression. Kleinmond Marching Band represents the heartbeat of the community — celebrating music, talent, and togetherness while inspiring the next generation.`,
  },
  {
    id: "art-frank-meintjies",
    name: "Frank Meintjies",
    discipline: "Poet, Author & Facilitator",
    bio: `Frank Meintjies has lived in KwaZulu-Natal, the Western Cape and Gauteng. He has worked in the field of social development over many decades. Frank's creative writing appears in literary journals and anthologies such as Botsotso, Ons Klyntji, Absolute Africa, Staffrider, and Soho Square, and was selected for inclusion in four editions of the annual Sol Plaatje European Union Anthology. He is profiled in the book Twelve + One Joburg Poets: Their Artistic Lives and Poetry, and his poems feature in the Grade 11 textbook Vistas of Poems and the Grade 12 textbook Landscapes of Poems. His earlier poetry collections include My Rainbow (2009), Connexions (2012), Unfettered Days (2015), Lockdown Poems (2020–2021), and Wind in the Trees (2022).

Frank's short stories have appeared in online journals such as Spillwords, The Kalahari Review, and Itch. Through interdisciplinary collaboration, William Kentridge's Centre for the Less Good Idea has platformed his poetry, notably in A Poetry Minute and the M1 Highway billboard initiative. His recent collection, A Place to Night In (2024), was shortlisted for the Poetry category of the 2025 South African Literary Awards and for the 2026 Ingrid Jonker Poetry Prize. He has written extensively on culture, coediting a special edition of Staffrider on Worker Culture and publishing essays on the literary contributions of Bessie Head, Don Mattera, James Matthews, and Achmat Dangor. With Edgar Pieterse, he coedited Voices of the Transition (2004). Frank has a PhD in Creative Writing from the University of Pretoria.`,
  },
  {
    id: "art-eugenia-zantoto",
    name: "Eugenia Zantoto",
    discipline: "Writer & Poet",
    bio: `Eugenia Zantoto is a Cape Town-based writer and poet whose work deeply explores themes of identity, home, resilience, and human connection. Born in the Democratic Republic of Congo and raised in South Africa, her experience growing up between two worlds profoundly shapes her global perspective and narrative voice. Eugenia's passion for storytelling was ignited by her grandmother, a gifted storyteller who passed down African folktales, family histories, and vital life lessons. Today, she channels that legacy into writing romance fiction and poetry, drawing inspiration from the lives, struggles, and hopes of ordinary people.

In 2024, Eugenia joined the Cape Cultural Collective, finding a vibrant community of creatives that encouraged her to share her unique voice. A year later, in 2025, she took her work to the stage, performing her poetry at the prestigious Artscape Theatre—a milestone that reinforced her belief in the power of both the written and spoken word. When she isn't writing, Eugenia is usually reading, developing new creative projects, or drawing inspiration from the community around her. For Eugenia, writing is a vital tool for preserving memories, building bridges, and elevating voices that deserve to be heard.`,
  },
  {
    id: "art-andries-du-toit",
    name: "Andries du Toit",
    discipline: "Writer & Researcher",
    bio: `Andries du Toit is a writer and researcher based in Muizenberg, Cape Town. His memoir A Blow to the Head: A History of Violence (2024) begins with a small, ordinary decision — to speak up against a racist slur at a gym coffee shop — and follows the chain of events it unleashes into unexpected territory: his own family history under apartheid, thirty years of work on land and poverty in South Africa, and a sustained reckoning with the nature of violence in a society whose brutality runs far beneath its surface. It is a book about what happens when you look directly at something you have spent a lifetime circling.

Du Toit spent nearly three decades as director of PLAAS, the Institute for Poverty, Land and Agrarian Studies at the University of the Western Cape (UWC), and now teaches at UWC's School of Government. His writing ranges across the political and the personal. His essay The Mountain in the Sea published in Multilingual Margins (2023), alongside work by Antjie Krog and Diana Ferrus, explores place, wilderness and history on the Atlantic face of Hoerikwaggo.`,
  },
  {
    id: "art-jennifer-pape",
    name: "Jennifer Pape",
    discipline: "Poet & Geochemist",
    bio: `Jennifer Pape was born in Hennenman in the Free State and developed an intense curiosity about nature from an early age. After finishing school, she studied geology at Kovsies (University of the Free State), earning a BSc Honours in Geology in 1992. She subsequently worked for the Council for Geoscience in Pretoria for eight years, during which time she also completed an MSc in Geochemistry at Wits (2000).

Alongside her interest in nature, she has a great passion for words. A dedicated bookworm, she has been writing poetry since her student days. In 2016, she founded the Stomme Jonge poetry club in Stellenbosch, which includes the participation of writer Tom Dreyer. Several of her poems have appeared in the literary journal Ons Klyntji, and she achieved second place in the Afrikaans category of the 2022 AVBOB Poetry Competition.

Her debut poetry collection, waar daar eens 'n see was, was published in 2025 by Turksvy Publikasies and shortlisted for the 2026 UJ Debut Prize. Her poem "die onmeetlike spasie" ("the immeasurable space") is featured in the Lina Spies tribute anthology Onthou is die dag wat breek. She also serves as the web designer for New Contrast Literary Magazine and enjoys collecting books and stones. She lives in Fisherhaven with her partner, Susan, and her daughter, Maya.`,
  },
  {
    id: "art-barbara-boswell",
    name: "Barbara Boswell",
    discipline: "Novelist & Professor of Literary Studies",
    bio: `Barbara Boswell is a Professor of English Literary Studies at the University of Cape Town and a novelist. She is the author of The Comrade's Wife (2024), winner of the 2025 University of Johannesburg Main Creative Writing Prize, (jointly with Shubnum Khan) winner of the National Arts and Culture Award (NACA) for 2025, and winner of the 2025 SALA Award for best novel in English. Her first work of fiction, Grace: A Novel (2017) won the University of Johannesburg's Debut Creative Writing Prize for 2018, and is published in North America as Unmaking Grace. Her scholarly books include the monograph And Wrote My Story Anyway: Black South African Women's Novels as Feminism (2020), which received UCT's Meritorious Book Award in 2023, and Lauretta Ngcobo: Writing as the Practice of Freedom (2022), which Barbara edited.

A former Fulbright and ACLS Fellow, Barbara has taught at the Universities of Virginia, Maryland and Witwatersrand before joining UCT. In 2024, she spent time as a Visiting Scholar at the University of Oxford's Centre for Life Writing. She holds a PhD in Women's Studies from the University of Maryland, and an MPhil degree in Gender and Women's Studies from the University of the Western Cape. Her areas of teaching and research expertise include African women's writing, Black Diasporic feminist writing, queer theory and literatures, and postcolonial studies. She has guest edited a number of journals and has published widely in academic journals and edited collections in these areas. Barbara is a member of the board of Agenda, a feminist journal, and of Imbiza Journal.`,
  },
  {
    id: "art-julijana-rossouw",
    name: "JuliJana Rossouw",
    discipline: "Poet, Artist & Workshop Facilitator",
    bio: `JuliJana has been active in the poetry scene both in Cape Town and London. She is co-presenter on Off the Wall in Cape Town and co-presented More Poetry with Ken Champion in London for 10 years. She holds creative writing workshops in Cape Town and surrounds. Her chapbook, ra-t, was published by Shearsman Publishers in London. Scent of Places (2025) is her debut collection published by Turksvy Publishers Cape Town. She has been published in poetry magazines in South Africa and abroad.

JuliJana received a Master's Degree in Creative Research from the University of Roehampton. She is both a poet and an artist.`,
  },
  {
    id: "art-rene-nassen",
    name: "Rene Nassen",
    discipline: "Visual Arts & Writing",
    bio: "Artist, medical educator, and author capturing personal and collective narratives in paint and text.",
  },
  {
    id: "art-sean-nefdt",
    name: "Sean Nefdt",
    discipline: "Visual Artist",
    bio: `Sean Nefdt is a South African artist whose work explores the relationship between emotion, memory, and the natural world. Drawing inspiration from everyday life, landscapes, and personal experiences, Sean creates artworks that invite viewers to pause, reflect, and connect with the stories and feelings embedded within each piece.

Working across a range of traditional media, Sean combines technical skill with a strong sense of creativity, producing work that balances realism with expressive interpretation. Each artwork is approached as an opportunity to capture not only the visual qualities of a subject but also its atmosphere, energy, and deeper meaning.

As a dedicated and continually evolving artist, Sean is committed to refining his practice while engaging with the broader arts community through exhibitions and creative collaborations. Participation in art festivals provides an opportunity to share this creative journey with diverse audiences, celebrate artistic expression, and contribute to South Africa's vibrant cultural landscape. Sean's goal is to create work that resonates on a personal level, encouraging conversation, inspiring curiosity, and leaving a lasting impression on those who experience it.`,
  },
  {
    id: "art-jody-brand",
    name: "Jody Brand",
    discipline: "Curator & Visual Artist",
    bio: "Prominent contemporary visual artist and cultural curator directing the exhibition showcase at The Grail Centre.",
  },
  {
    id: "art-chris-ferndale",
    name: "Chris Ferndale",
    discipline: "Poet & Cultural Facilitator",
    bio: `Chris has been writing and performing poetry for more than 30 years. He was a member of the Congress of South African Writers (COSAW) in the 1980s and organised cultural events during the anti-apartheid struggle, especially during the 1980s. He was a founder member of the Cape Cultural Collective in 2007.

His poems have been published in numerous anthologies including a prescribed anthology for high school learners, Carapace, two Cape Cultural Collective poetry anthologies — At Truth's Edge (2011) and Beyond Truth's Edge (2022) — as well as in Voices Unbound (2023): Eighth International Symposium on Poetic Inquiry published by the Human Sciences Research Council.

Chris has performed at the District Six Museum, Castle of Good Hope, The Slave Church, the first Jazz on the Rocks event, the Cape Town Festival, the Autumn Festival in Paris (2013), Freedom Park in Pretoria, Artscape, the launch of Voices Unbound and at the Open Book Festival (2023).

He writes and performs in Afrikaans, English and Kaaps. He has performed his poetry alongside several artists including Hilton Schilder, guitarists Elton Goslett and Zackie Johnson. He is dedicated to youth development and employs poetry as an effective facilitation tool.`,
  },
  {
    id: "art-jeremy-vearey",
    name: "Jeremy Vearey",
    discipline: "Author & Historian",
    bio: `Jeremy Vearey is a writer, former Major General in the South African Police Service (SAPS), and anti-gang strategist from Elsies River, Cape Town. In Jeremy vannie Elsies (2018) he tells the raw, personal story of growing up in Elsies River, from rough-and-tumble youth to Robben Island prisoner, MK operative, and head of SAP Western Cape's anti-gang unit. It's a memoir of community, struggle, and survival.

In Rooisand: Die verhaal van Dirk Aruseb en die Bondelswarts (2024) he co-authors the historical account of Dirk Aruseb and the Bondelswarts uprising, bringing overlooked resistance history to a new generation. Vearey now works as Strategic Advisor at Gunfree SA.`,
  },
  {
    id: "art-mary-hull",
    name: "Mary Hull",
    discipline: "Small-Scale Fisherwoman & Community Leader",
    bio: `Mary Hull is a prominent small-scale fisherwoman, community leader, and activist from Kleinmond, Western Cape, South Africa. She is widely known for her decades-long advocacy supporting local fishing communities, sustainable seafood practices, and equitable fishing rights. Mary Hull has lived in Kleinmond for over five decades, becoming deeply involved in local fisheries issues since the early 2000s. She works closely with organisations like Masifundise Development Trust and the Kogelberg Biosphere Reserve to secure formal quotas and fair permit conditions for small-scale local fishers. She frequently represents coastal women and artisanal fishers at national and regional dialogues, advocating for ocean conservation alongside the socio-economic survival of fishing families.`,
  },
  {
    id: "art-nicholas-taylor",
    name: "Nicholas Taylor",
    discipline: "Storytelling & Poetry",
    bio: "Writer and storyteller sharing heartfelt narratives of place, belonging, and Western Cape communities.",
  },
  {
    id: "art-colleen-higgs",
    name: "Colleen Higgs",
    discipline: "Publisher, Writer & Writing Teacher (Modjaji Books)",
    bio: `Colleen Higgs is a publisher, a writer, and writing teacher. Two collections of her poems have been published — Half Born Woman (2004) and Lava Lamp Poems (2011). Her short story collection, Looking for Trouble came out in 2012 and was recently republished in the US by Catalyst Press. Her memoir, my mother, my madness was published in 2020 by deep south. Modjaji Books, which she started in 2007, has become an award-winning, internationally recognised small, independent feminist press. She lives in Cape Town with her daughter, a cat and a dog.`,
  },
  {
    id: "art-winslow-schalkwyk",
    name: "Winslow Schalkwyk",
    discipline: "Facilitator & Writer",
    bio: "Skilled writing facilitator and performer co-directing creative workshops and open mic platforms.",
  },
  {
    id: "art-naren-sewpaul",
    name: "Naren Sewpaul",
    discipline: "Co-Design Facilitator & Integrated Arts Practitioner",
    bio: `Naren Sewpaul is a co-design facilitator, songwriter, and integrated arts practitioner who works with social artists from diverse art disciplines. Some of the artists with whom he has collaborated are Steve Fataar, Beathur Mgoza-Baker, Delia Meyer, and Abduragman Adams. He presented the Bush Radio Vinyl Music Sessions, served on the founding committee for the Arterial Network and represented South Africa on the discussion forum at Contacting the World Festival in Manchester (UK). He is currently adviser to the dance and photography company, Darkroom Contemporary.`,
  },
  {
    id: "art-jade-gibson",
    name: "Jade Gibson",
    discipline: "Interdisciplinary Writer, Visual Artist & Researcher",
    bio: `Jade Gibson is an interdisciplinary writer, visual artist, and academic researcher whose work explores visibility, embodiment, being-in-the-world, and the spaces in-between. She is the author of the prize-listed novel, Glowfly Dance (2015). Based on her own childhood, the novel explores child resilience, girlhood, and the impact of domestic violence through relationships with nature, loss, and multicultural lived experience.

Her visual art spans installation, poetry, painting, drawing, performance and short film — from carrying a skeleton made of twigs around Cape Town to inviting audiences to dress her according to her perceived ethnicity, to creating a maize installation from broken glass. She has exhibited and worked in Cape Town, London, Zimbabwe and Vanuatu. Of mixed ethnicity (half-Filipino), Jade grew up in the UK, North Africa and the Caribbean, with her closest family in Africa. Her academic background is deeply interdisciplinary, encompassing a PhD and MA in visual anthropology, and degrees in fine art and medical science.`,
  },
  {
    id: "art-vuyo-myoli",
    name: "Vuyo Myoli",
    discipline: "Multidisciplinary Performer, Composer & Theatre Practitioner",
    bio: `Vuyo Myoli is a South African multidisciplinary performer, vocalist, composer, theatre practitioner, and cultural worker from Gugulethu, Cape Town. Trained at the Professional Music, Performance and Technology College (PROMPT), his artistic practice spans music, theatre, storytelling, community engagement, and ecological awareness. Over a performance career spanning more than fifteen years, Myoli has worked across local and international stages as a vocalist, songwriter, arranger, and performer. He has appeared in numerous festivals, corporate events, conferences, and theatrical productions, including the internationally recognized theatre production Diamond and Dust / Under African Skies. His touring history includes performances across Bahrain, Thailand, Zimbabwe, the Netherlands, Belgium, Denmark, France, Martinique, the United States, and Dubai.

Alongside his performance career, Myoli has remained deeply invested in community-based artistic development. Through his initiative Indibano ("A gathering place"), he facilitated music workshops and mentorship programs for aspiring young musicians in Gugulethu, creating access to creative learning spaces within the township community. Following a difficult period of personal and professional transition, Myoli turned toward organic growing, urban farming, and beekeeping as a process of healing and reconnection. Working with soil, food systems, and pollination opened a new artistic and philosophical direction in his practice — one that merges ecology, ritual performance, music, and storytelling.

This journey became the foundation for Lonely Bee, an interdisciplinary theatre and music production exploring themes of isolation, resilience, healing, memory, collective survival, and humanity's relationship with nature. Through this work, Myoli continues developing a unique performance language rooted in African storytelling traditions, live music, physical theatre, and environmental consciousness.`,
  },
  {
    id: "art-indiphile-matini",
    name: "Indiphile Matini",
    discipline: "Social Justice Activist & Creative Practitioner",
    bio: `Indiphile Matini is a social justice activist with a background in social work. They strive to make meaningful contributions to the sector through their work and creativity. Indiphile uses their experiences and observations of the world to paint pictures of our individual and collective realities. The use of art and creativity in activism has always played an instrumental role in dismantling oppressive systems of power and Indiphile believes our words and creations have the power to shape a world where humanity and the environment coexist in harmony.`,
  },
  {
    id: "art-ncebakazi-mnukwana",
    name: "Dr. Ncebakazi Mnukwana",
    discipline: "Musician, Soundscaper & Academic",
    bio: `Dr. Ncebakazi Mnukwana is a musician, soundscaper, and academic specialising in African music and Music Education at Stellenbosch University. A prominent performer on the Xhosa uhadi bow, she has collaborated with music legends like Latozi "Madosini" Mphahleni and produced Mantombi Matotiyana's Songs of Greeting, Healing and Heritage.

Her international and local performance and composition work includes projects for the Bolwerk Festival (Switzerland), Woordfees, NIROX Sculpture Park, and the South African Strings Foundation. In 2023, she founded the Cape Town-based ensemble iiNceba zoMdali, and she frequently co-composes across continents with Roche van Tiddens. Beyond her creative and academic roles, Dr. Mnukwana serves on several boards, including the Stellenbosch University Museum, Camissa Museum, Molo Songololo, and Cornerstone Institute.`,
  },
  {
    id: "art-andre-louw",
    name: "Andre Louw",
    discipline: "Crime Fiction Author & Legal Scholar",
    bio: `After unsuccessfully reaching rock star fame as a guitarist, Andre M. Louw qualified as an attorney in 2000 and received a PhD in Law in 2010. He has taught at the University of KwaZulu-Natal and currently teaches at Stellenbosch University. Through his fascination with corruption and love of reading crime fiction comes his first novel Phantom Pass (2026). Louw currently lives in Villiersdorp, South Africa with his partner and their teenage son.`,
  },
  {
    id: "art-consuelo-roland",
    name: "Consuelo Roland",
    discipline: "Novelist & Crime Fiction Writer",
    bio: `Consuelo Roland left the information technology industry to complete an MA Masters in Creative Writing at the University of Cape Town. Her debut novel, The Good Cemetery Guide (2005), was short-listed for the Sunday Times Fiction Prize. It was also selected via an e-mail poll of readers as one of 30 Centre for the Book's "must read" South African Books for 2007. She lives with her husband and son and a menagerie of pets.`,
  },
  {
    id: "art-sonja-vanderwesthuizen",
    name: "Sonja van der Westhuizen",
    discipline: "Book Critic, Editor & Literary Host",
    bio: `Sonja van der Westhuizen is a book critic for local and international publications. She reviews, among others, for Die Burger, SARIE, The European Literature Network and the UK site Crime Fiction Lover. Although crime fiction is her area of expertise, she will read almost anything, even more so if it's a translation.

Sonja is on the judging panels for the UK Crime Writers' Association Daggers (CWA's), the Ngaio Marsh Awards for New Zealand crime fiction and the Petrona Award for Scandinavian crime fiction. When she's not reviewing or reading, she's a graphic designer, editor and proofreader.`,
  },
  {
    id: "art-verse-en-mense",
    name: "Verse & Mense",
    discipline: "Word Artists & Spoken Word Ensemble",
    bio: `Based in Kleinmond, Verse & Mense are word artists; with play, tickle, and tease; entertain or infuriate. Between the sea and the mountain, reaching from the deepest depths to the furthest distance, listening in where it whispers, looking out from the highest peaks, they make and build words that feel and speak, and sometimes just stand there.`,
  },
  {
    id: "art-tribal-echo",
    name: "Tribal Echo",
    discipline: "Eclectic Roots Rock Band",
    bio: `Tribal Echo is a vibrant South African band known for their unique musical identity, Eclectic Roots Rock — a distinctive sound that blends Afrikaans storytelling, rock, roots, and diverse musical influences into an unforgettable experience. The band consists of Frazer Barry (lead vocals & guitar), Deniel Barry (drums & vocals), and Earl Witbooi (bass guitar & vocals). Together, they create a fresh and original sound, combining powerful lyrics, infectious melodies, rich harmonies, and energetic performances.

As accomplished musicians and creators, the members of Tribal Echo have also been involved in various award-winning musical theatre productions on national and international platforms, bringing a strong theatrical influence to their music and live performances. Describing their music as a celebration of life, Tribal Echo's songs tell stories that connect deeply with audiences. Their music explores everyday experiences, emotions, struggles, dreams, and moments of joy — creating a sound that invites audiences to laugh, dance, reflect, and be moved. Tribal Echo Trio takes audiences on a powerful musical journey — an experience that celebrates culture, storytelling, and the heartbeat of South African music in Afrikaans.`,
  },
  {
    id: "art-camissa-knights",
    name: "Camissa Knights",
    discipline: "South African Jazz Quartet",
    bio: `Camissa Knights is a vibrant South African jazz quartet that blends the country's rich musical heritage with international influences to create a unique sound that's both rooted and adventurous. The band's members — pianist George Werner, electric bassist Peter Ndlala, drummer Carlo Fabe, and trumpeter Muneeb Hermans — have all been mentored by some of the greatest jazz musicians in the country, and have honed their skills through years of performing and recording together. Camissa Knights are a band with a deep understanding of the jazz tradition, incorporating elements of Afrobeat, funk, and rock into their music to create a sound that's both familiar and fresh.

George Werner's piano playing is a key element of the band's sound, with his dynamic touch and intricate phrasing bringing depth and nuance to every song. Peter Ndlala's electric bass provides a solid foundation with thunderous rhythms, while Carlo Fabe's drums bring a sense of energy and excitement to every performance. And then there's Muneeb Hermans, whose trumpet playing is both melodic and virtuosic, capable of soaring above the rest of the band or digging deep into the rhythm section.

Camissa Knights' music is perfect for fans of South African jazz and anyone who loves a good groove or a killer solo. Whether they're playing in a club, festival, or concert hall, this band always brings the house down with their infectious energy and joyful music.`,
  },
  {
    id: "art-beverley-brown",
    name: "Beverley (Bev) Brown",
    discipline: "Visual Artist & Community Art Facilitator",
    bio: `Beverley Brown has over 43 years of experience conducting community art sessions with youth in art and female social inclusive programs as part of therapy and escapism. Her accolades include winning school competitions and private sector prizes, including the BP South Africa competition which funded her second-year studies.

She already has over 100 artworks in circulation, the majority of them commissions. Many of her pieces were designed for individual South African clients living abroad, who love having memories of home away from home. Her Township Art and the Bo-Kaap colourful houses series are two such examples. The Bo-Kaap works have been seen in a variety of locations around the world, including different provinces. Bev also has an international footprint, with two wall murals in Namibia.

Bev's style is primarily realistic but is elevated by impressionistic techniques and a bold, vibrant palette. Working mostly with acrylics, she sees African women's attire as expressive, leading her to use mixed media to create texture. Her latest passions include capturing mother-and-child imagery from her hikes and incorporating the fluidity of the sea into her work.`,
  },
  {
    id: "art-anthony-silverston",
    name: "Anthony Silverston",
    discipline: "Animation Director & Graphic Novelist",
    affiliation: "Catalyst Press",
    bio: `Anthony Silverston is partner and Creative Director at Triggerfish, where he oversees a slate of projects in development and production. He directed and cowrote Khumba, produced and wrote on Adventures in Zambezia and Seal Team and was Executive Producer on Kizazi Moto: Generation Fire (Disney+), Supa Team 4 (Netflix), and Kiya & the Kimoja Heroes (Disney, eOne and Frogbox). His graphic novel, Pearl of the Sea (2023), co-written with Raffaella Delle Donne and Willem Samuel, received critical acclaim.`,
  },
  {
    id: "art-shakira-maharaj",
    name: "Shakira Maharaj",
    discipline: "Children's Book Author",
    affiliation: "Catalyst Press",
    bio: `Shakira Maharaj is a debut children's book author from South Africa. She lives in Cape Town with her young son, tired husband and chubby dog. She has a Master's Degree from the University of Cape Town, and when she's not writing or mothering, she works for an NGO focused on early childhood development.`,
  },
  {
    id: "art-shihaam-domingo",
    name: "Shihaam Domingo",
    discipline: "Creative Producer & Indigenous Food Storyteller",
    bio: `Shihaam is a creative producer and indigenous food storyteller whose work fuses ancestral knowledge, foraged ingredients, and culinary heritage in contemporary food experiences. Her practice is rooted in honouring the land and sea, drawing on indigenous plants and seasonal abundance to craft menus that are as much about memory and identity as they are about taste. Shihaam has curated food stories that reconnect people with the histories of the Cape, including a menu in honour of Krotoa. This timeless menu reimagines what might have been eaten at the Cape in the 1600s using ingredients sourced from veld, coast, and small-scale custodians.

Her work often bridges ritual and innovation, from reimagining childhood traditions such as Easter pickled fish to leading conversations at the Food Imbizo about the risks and potentials of indigenous food revival. Through her cooking, storytelling, and advocacy, Shihaam invites communities to rediscover the dignity, creativity, and resilience within indigenous food systems; reviving lost flavours while nourishing a deeper sense of belonging to place and culture.`,
  },
  {
    id: "art-vusumuzi-mpofu",
    name: "Vusumuzi Mpofu",
    discipline: "Poetry, Performance & MC",
    bio: "Spoken word poet, MC, and facilitator co-hosting the KliK Kleinmond Has Talent Competition and the closing Sunday Open Mic stage.",
  },
];

export const SEED_VENUES: VenueLocation[] = [
  {
    id: "loc-the-shed",
    name: "The Shed, Kleinmond Harbour",
    shortName: "The Shed",
    category: "performance",
    address: "Harbour Road Waterfront, Kleinmond Harbour",
    latitude: -34.34450204872072,
    longitude: 19.013265126018695,
    accessibilityNotes: "Level entrance ramp, wide sliding doors, accessible waterfront parking adjacent.",
    hasToilets: true,
    hasParking: true,
    hasFoodNearby: true,
    isWheelchairAccessible: true,
    capacity: 250,
    qrCodeToken: "seed-token-the-shed-2026",
  },
  {
    id: "loc-town-hall",
    name: "Kleinmond Town Hall",
    shortName: "Town Hall",
    category: "market",
    address: "Main Road 54, Kleinmond Central",
    latitude: -34.3402639030926,
    longitude: 19.031953496893404,
    accessibilityNotes: "Level entrance ramp, wide double doors, accessible restrooms on ground floor.",
    hasToilets: true,
    hasParking: true,
    hasFoodNearby: true,
    isWheelchairAccessible: true,
    capacity: 350,
    qrCodeToken: "seed-token-town-hall-2026",
  },
  {
    id: "loc-main-beach",
    name: "Kleinmond Main Beach",
    shortName: "Main Beach",
    category: "outdoor",
    address: "Beach Road & Pavilion, Kleinmond",
    latitude: -34.34202440727965,
    longitude: 19.03690657615237,
    accessibilityNotes: "Paved beach boardwalk access with gentle gradient down to beach viewing terrace.",
    hasToilets: true,
    hasParking: true,
    hasFoodNearby: true,
    isWheelchairAccessible: true,
    capacity: 500,
    qrCodeToken: "seed-token-main-beach-2026",
  },
  {
    id: "loc-marching-route",
    name: "Kleinmond Main Road to Kleinmond Town Hall",
    shortName: "Parade Route",
    category: "outdoor",
    address: "Main Road Parade Route, Kleinmond",
    latitude: -34.3402639030926,
    longitude: 19.031953496893404,
    accessibilityNotes: "Public sidewalk and curbs with ramps along the main festival parade corridor.",
    hasToilets: true,
    hasParking: true,
    hasFoodNearby: true,
    isWheelchairAccessible: true,
    capacity: 1000,
    qrCodeToken: "seed-token-parade-route-2026",
  },
  {
    id: "loc-mthimkhulu",
    name: "Mthimkhulu Village Centre (Mthimkhulu Community Development)",
    shortName: "Mthimkhulu Village Centre",
    category: "youth",
    address: "9th Avenue, Kleinmond",
    latitude: -34.33950109256984,
    longitude: 19.01917005216947,
    accessibilityNotes: "Full ramp access, classrooms, reading room, stage and amphitheatre area, accessible amenities.",
    hasToilets: true,
    hasParking: true,
    hasFoodNearby: true,
    isWheelchairAccessible: true,
    capacity: 200,
    qrCodeToken: "seed-token-mthimkhulu-2026",
  },
  {
    id: "loc-central-cafe",
    name: "Kleinmond Central Café",
    shortName: "Central Café",
    category: "workshop",
    address: "2 Botrivier Road, Kleinmond",
    latitude: -34.33967733107695,
    longitude: 19.033159917813823,
    accessibilityNotes: "Ground level café seating, covered veranda, accessible street parking on Botrivier Road.",
    hasToilets: true,
    hasParking: true,
    hasFoodNearby: true,
    isWheelchairAccessible: true,
    capacity: 80,
    qrCodeToken: "seed-token-central-cafe-2026",
  },
  {
    id: "loc-the-grail",
    name: "The Grail Centre",
    shortName: "The Grail Centre",
    category: "theatre",
    address: "39 15th Avenue, Kleinmond",
    latitude: -34.33289335544888,
    longitude: 19.031115836728514,
    accessibilityNotes: "Tranquil garden property with gravel and paved pathways, hall ramp, accessible restrooms.",
    hasToilets: true,
    hasParking: true,
    hasFoodNearby: true,
    isWheelchairAccessible: true,
    capacity: 300,
    qrCodeToken: "seed-token-the-grail-2026",
  },
  {
    id: "loc-tides",
    name: "Tides Restaurant, Kleinmond Harbour",
    shortName: "Tides Restaurant",
    category: "food_drink",
    address: "Harbour Road Waterfront, Kleinmond Harbour",
    latitude: -34.34450984903708,
    longitude: 19.013618274978494,
    accessibilityNotes: "Harbour view restaurant, ground floor dining terrace with direct waterfront access.",
    hasToilets: true,
    hasParking: true,
    hasFoodNearby: true,
    isWheelchairAccessible: true,
    capacity: 100,
    qrCodeToken: "seed-token-tides-2026",
  },
];

export const SEED_EVENTS: FestivalEvent[] = [
  // ==========================================
  // FRIDAY, 27 NOVEMBER 2026
  // ==========================================
  {
    id: "evt-fri-klik-market",
    title: "KliK Market",
    description:
      "Opening evening festival market showcasing local Overberg artisans, food stalls, fynbos crafts, and community creations in the Town Hall. Free Zone.",
    date: "2026-11-27",
    startTime: "16:00",
    endTime: "21:00",
    venueId: "loc-town-hall",
    venueName: "Kleinmond Town Hall",
    category: "market",
    language: "multilingual",
    isTicketed: false,
    artists: [],
    accessibilityInfo: "Full ramp access, wheelchair accessible ground floor hall.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: true,
  },
  {
    id: "evt-fri-official-opening",
    title: "Welcome and Official Opening of KliK",
    description:
      "A tribute to Diana Ferrus, featuring the Mengelmoesdigters, Frazer Barry and Khadija Heeger at The Shed, Kleinmond Harbour.",
    date: "2026-11-27",
    startTime: "19:00",
    endTime: "20:30",
    venueId: "loc-the-shed",
    venueName: "The Shed, Kleinmond Harbour",
    category: "poetry",
    language: "bilingual",
    isTicketed: true,
    ticketPrice: "R100",
    quicketUrl: "https://www.quicket.co.za/events/339579-kleinmond-inniebos-kunstefees-klik/",
    artists: [
      SEED_ARTISTS.find((a) => a.id === "art-mengelmoesdigters")!,
      SEED_ARTISTS.find((a) => a.id === "art-frazer-barry")!,
      SEED_ARTISTS.find((a) => a.id === "art-khadija-heeger")!,
    ],
    accessibilityInfo: "Wheelchair ramp, reserved seating near stage.",
    scheduleStatus: "scheduled",
    statusNotice: "A Tribute to Diana Ferrus",
    checkInAvailable: true,
    isFeatured: true,
  },

  // ==========================================
  // SATURDAY, 28 NOVEMBER 2026
  // ==========================================
  {
    id: "evt-sat-staptog",
    title: "See en Fynbos Paradys Staptog",
    description:
      "Assemble at Kleinmond Main Beach for an early morning coastal walk from Kleinmond Main Beach to Kleinmond Harbour and back with Philip Balie.",
    date: "2026-11-28",
    startTime: "07:30",
    endTime: "09:30",
    venueId: "loc-main-beach",
    venueName: "Kleinmond Main Beach",
    category: "outdoor",
    language: "af",
    isTicketed: false,
    artists: [SEED_ARTISTS.find((a) => a.id === "art-philip-balie")!],
    accessibilityInfo: "Beach sand and gravel boardwalk walking route. Sturdy walking shoes recommended.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: true,
    venueHub: "start_your_day",
  },
  {
    id: "evt-sat-marching-band",
    title: "Kleinmond Marching Band",
    description:
      "Parade from Kleinmond Main Road to Kleinmond Town Hall featuring the celebratory fanfare of the Kleinmond Marching Band.",
    date: "2026-11-28",
    startTime: "09:00",
    endTime: "09:45",
    venueId: "loc-marching-route",
    venueName: "Kleinmond Main Road to Kleinmond Town Hall",
    category: "music",
    language: "multilingual",
    isTicketed: false,
    artists: [SEED_ARTISTS.find((a) => a.id === "art-marching-band")!],
    accessibilityInfo: "Street level parade viewing with accessible sidewalks along Main Road.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: false,
    venueHub: "start_your_day",
  },
  {
    id: "evt-sat-market",
    title: "KliK Market",
    description:
      "Vibrant Saturday community craft and artisanal market at Kleinmond Town Hall. Local food stalls, handmade fynbos crafts, and community creations. Free Zone.",
    date: "2026-11-28",
    startTime: "09:00",
    endTime: "14:00",
    venueId: "loc-town-hall",
    venueName: "Kleinmond Town Hall",
    category: "market",
    language: "multilingual",
    isTicketed: false,
    artists: [],
    accessibilityInfo: "Level wheelchair ramp, wide aisles between market stalls.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: false,
    venueHub: "start_your_day",
  },
  {
    id: "evt-sat-grail-art-exhibition",
    title: "Art Exhibition",
    description:
      "Visual art exhibition with artists Rene Nassen and Sean Nefdt, curated by Jody Brand at The Grail Centre. Free Zone.",
    date: "2026-11-28",
    startTime: "10:00",
    endTime: "17:00",
    venueId: "loc-the-grail",
    venueName: "The Grail Centre, 39 15th Avenue",
    category: "art",
    language: "multilingual",
    isTicketed: false,
    artists: [
      SEED_ARTISTS.find((a) => a.id === "art-rene-nassen")!,
      SEED_ARTISTS.find((a) => a.id === "art-sean-nefdt")!,
      SEED_ARTISTS.find((a) => a.id === "art-jody-brand")!,
    ],
    accessibilityInfo: "Gallery hall with ramp access, garden resting areas.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: true,
    venueHub: "the_grail",
  },

  // ==========================================
  // CHILDREN & YOUTH PROGRAMME (SAT 28 NOV, 10:00–14:00)
  // Mthimkhulu Village Centre / Mthimkhulu Community Development, 9th Avenue
  // ==========================================
  {
    id: "evt-sat-youth-visual-art",
    title: "Visual Art",
    description:
      "Children & Youth Programme creative visual art session facilitated by Beverley (Bev) Brown at Mthimkhulu Smart Kids.",
    date: "2026-11-28",
    startTime: "10:00",
    endTime: "12:00",
    venueId: "loc-mthimkhulu",
    venueName: "Mthimkhulu Village Centre, 9th Avenue",
    subVenue: "Mthimkhulu Smart Kids",
    category: "youth",
    language: "multilingual",
    isTicketed: false,
    ageGroup: "10–12",
    facilitatorDisplay: "Beverley (Bev) Brown",
    artists: [SEED_ARTISTS.find((a) => a.id === "art-beverley-brown")!],
    accessibilityInfo: "Accessible classroom space at Mthimkhulu Village Centre.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: false,
    isDraft: true,
    venueHub: "around_kleinmond",
  },
  {
    id: "evt-sat-youth-graphic-novel",
    title: "Graphic Novel Storytelling",
    description:
      "Children & Youth Programme graphic novel storytelling session with Anthony Silverston (Catalyst Press) in the Mthimkhulu Reading Room.",
    date: "2026-11-28",
    startTime: "10:00",
    endTime: "11:00",
    venueId: "loc-mthimkhulu",
    venueName: "Mthimkhulu Village Centre, 9th Avenue",
    subVenue: "Mthimkhulu Reading Room",
    category: "youth",
    language: "multilingual",
    isTicketed: false,
    ageGroup: "8–12",
    facilitatorDisplay: "Anthony Silverston",
    affiliation: "Catalyst Press",
    capacityNote: "Capacity: 20 children",
    artists: [SEED_ARTISTS.find((a) => a.id === "art-anthony-silverston")!],
    accessibilityInfo: "Ground-level reading room at Mthimkhulu Village Centre.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: true,
    isDraft: true,
    venueHub: "around_kleinmond",
  },
  {
    id: "evt-sat-youth-storytelling-poetry",
    title: "Storytelling and Poetry",
    description:
      "Children & Youth Programme storytelling and poetry workshop facilitated by the Mengelmoesdigters, including Merle Danhouse and Theresa Carstens.",
    date: "2026-11-28",
    startTime: "10:00",
    endTime: "12:00",
    venueId: "loc-mthimkhulu",
    venueName: "Mthimkhulu Village Centre, 9th Avenue",
    subVenue: "Erica Classroom 2",
    category: "youth",
    language: "bilingual",
    isTicketed: false,
    ageGroup: "12–14",
    facilitatorDisplay: "Mengelmoesdigters, including Merle Danhouse and Theresa Carstens",
    capacityNote: "Capacity: 25 children",
    artists: [
      SEED_ARTISTS.find((a) => a.id === "art-mengelmoesdigters")!,
      SEED_ARTISTS.find((a) => a.id === "art-merle-danhouse")!,
      SEED_ARTISTS.find((a) => a.id === "art-theresa-carstens")!,
    ],
    accessibilityInfo: "Accessible classroom space at Mthimkhulu Village Centre.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: false,
    isDraft: true,
    venueHub: "around_kleinmond",
  },
  {
    id: "evt-sat-youth-childrens-storytelling",
    title: "Children's Storytelling",
    description:
      "Children & Youth Programme storytelling session facilitated by debut children's book author Shakira Maharaj (Catalyst Press).",
    date: "2026-11-28",
    startTime: "10:00",
    endTime: "11:00",
    venueId: "loc-mthimkhulu",
    venueName: "Mthimkhulu Village Centre, 9th Avenue",
    subVenue: "Amaryllis Classroom 1",
    category: "youth",
    language: "en",
    isTicketed: false,
    ageGroup: "12–14",
    facilitatorDisplay: "Shakira Maharaj",
    affiliation: "Catalyst Press",
    capacityNote: "Capacity: 25 children",
    artists: [SEED_ARTISTS.find((a) => a.id === "art-shakira-maharaj")!],
    accessibilityInfo: "Accessible classroom space at Mthimkhulu Village Centre.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: false,
    isDraft: true,
    venueHub: "around_kleinmond",
  },
  {
    id: "evt-sat-youth-drama-choral",
    title: "Drama and Choral Verse",
    description:
      "Children & Youth Programme drama and choral verse activity facilitated by Hermien de Vos (Bamboesiena) at the Stage and Amphitheatre Area.",
    date: "2026-11-28",
    startTime: "11:00",
    endTime: "12:00",
    venueId: "loc-mthimkhulu",
    venueName: "Mthimkhulu Village Centre, 9th Avenue",
    subVenue: "Stage and Amphitheatre Area",
    category: "youth",
    language: "multilingual",
    isTicketed: false,
    ageGroup: "8–14",
    facilitatorDisplay: "Hermien de Vos (Bamboesiena)",
    capacityNote: "Capacity: 50 children",
    artists: [],
    accessibilityInfo: "Outdoor stage and amphitheatre courtyard at Mthimkhulu Village Centre.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: false,
    isDraft: true,
    venueHub: "around_kleinmond",
  },
  {
    id: "evt-sat-youth-jazz-jamming",
    title: "Jazz Jamming",
    description:
      "Afternoon Children & Youth Programme interactive jazz jamming session with South African jazz quartet Camissa Knights.",
    date: "2026-11-28",
    startTime: "13:00",
    endTime: "14:00",
    venueId: "loc-mthimkhulu",
    venueName: "Mthimkhulu Village Centre, 9th Avenue",
    subVenue: "Amaryllis Classroom 1",
    category: "youth",
    language: "multilingual",
    isTicketed: false,
    facilitatorDisplay: "Camissa Knights",
    artists: [SEED_ARTISTS.find((a) => a.id === "art-camissa-knights")!],
    accessibilityInfo: "Accessible classroom space at Mthimkhulu Village Centre.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: false,
    isDraft: true,
    venueHub: "around_kleinmond",
  },
  {
    id: "evt-sat-youth-hip-hop",
    title: "Hip Hop Dance-Off",
    description:
      "Afternoon Children & Youth Programme high-energy Hip Hop Dance-Off facilitated by the Cape Winelands Hip Hop Academy.",
    date: "2026-11-28",
    startTime: "13:00",
    endTime: "14:00",
    venueId: "loc-mthimkhulu",
    venueName: "Mthimkhulu Village Centre, 9th Avenue",
    subVenue: "Stage and Amphitheatre Area",
    category: "youth",
    language: "multilingual",
    isTicketed: false,
    facilitatorDisplay: "Cape Winelands Hip Hop Academy",
    artists: [],
    accessibilityInfo: "Outdoor stage and amphitheatre courtyard at Mthimkhulu Village Centre.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: false,
    isDraft: true,
    venueHub: "around_kleinmond",
  },

  // ==========================================
  // THE WRITERS CAFÉ AT KLEINMOND CENTRAL CAFÉ
  // ==========================================
  {
    id: "evt-sat-cafe-zantoto",
    title: "The Writers Café: Eugenia Zantoto",
    description:
      "Writers in Conversation with Frank Meintjies: Poet and online fiction author Eugenia Zantoto exploring identity, resilience, and narrative craft. Access included with Saturday Writer's Café Day Access (R100) or valid Festival Pass.",
    date: "2026-11-28",
    startTime: "10:00",
    endTime: "10:45",
    venueId: "loc-central-cafe",
    venueName: "Kleinmond Central Café, 2 Botrivier Road",
    category: "stories",
    language: "en",
    isTicketed: true,
    ticketPrice: "Writer's Café Day Access (R100)",
    artists: [
      SEED_ARTISTS.find((a) => a.id === "art-eugenia-zantoto")!,
      SEED_ARTISTS.find((a) => a.id === "art-frank-meintjies")!,
    ],
    accessibilityInfo: "Café veranda seating, level ground floor access.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: false,
    venueHub: "around_kleinmond",
  },
  {
    id: "evt-sat-cafe-dutoit",
    title: "The Writers Café: Andries du Toit",
    description:
      "Writers in Conversation with Frank Meintjies: Writer and researcher Andries du Toit discusses his memoir 'A Blow to the Head: A History of Violence' (2024). Access included with Saturday Writer's Café Day Access (R100) or valid Festival Pass.",
    date: "2026-11-28",
    startTime: "11:00",
    endTime: "11:45",
    venueId: "loc-central-cafe",
    venueName: "Kleinmond Central Café, 2 Botrivier Road",
    category: "stories",
    language: "bilingual",
    isTicketed: true,
    ticketPrice: "Writer's Café Day Access (R100)",
    artists: [
      SEED_ARTISTS.find((a) => a.id === "art-andries-du-toit")!,
      SEED_ARTISTS.find((a) => a.id === "art-frank-meintjies")!,
    ],
    accessibilityInfo: "Café seating, hearing assistance supported.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: false,
    venueHub: "around_kleinmond",
  },
  {
    id: "evt-sat-cafe-boswell",
    title: "The Writers Café: Barbara Boswell",
    description:
      "Writers in Conversation with Frank Meintjies: Award-winning novelist Barbara Boswell discusses 'Grace: A Novel' (2017) and 'The Comrade's Wife' (2024). Access included with Saturday Writer's Café Day Access (R100) or valid Festival Pass.",
    date: "2026-11-28",
    startTime: "12:00",
    endTime: "12:45",
    venueId: "loc-central-cafe",
    venueName: "Kleinmond Central Café, 2 Botrivier Road",
    category: "stories",
    language: "en",
    isTicketed: true,
    ticketPrice: "Writer's Café Day Access (R100)",
    artists: [
      SEED_ARTISTS.find((a) => a.id === "art-barbara-boswell")!,
      SEED_ARTISTS.find((a) => a.id === "art-frank-meintjies")!,
    ],
    accessibilityInfo: "Café seating with accessible facilities.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: false,
    venueHub: "around_kleinmond",
  },
  {
    id: "evt-sat-cafe-pape",
    title: "The Writers Café: Jennifer Pape",
    description:
      "Writers in Conversation with Frank Meintjies: Poet Jennifer Pape discussing her UJ Debut Prize-shortlisted collection 'Waar daar eens 'n see was' (2025). Access included with Saturday Writer's Café Day Access (R100) or valid Festival Pass.",
    date: "2026-11-28",
    startTime: "14:00",
    endTime: "14:45",
    venueId: "loc-central-cafe",
    venueName: "Kleinmond Central Café, 2 Botrivier Road",
    category: "poetry",
    language: "af",
    isTicketed: true,
    ticketPrice: "Writer's Café Day Access (R100)",
    artists: [
      SEED_ARTISTS.find((a) => a.id === "art-jennifer-pape")!,
      SEED_ARTISTS.find((a) => a.id === "art-frank-meintjies")!,
    ],
    accessibilityInfo: "Café seating, level access.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: false,
    venueHub: "around_kleinmond",
  },
  {
    id: "evt-sat-cafe-heeger",
    title: "The Writers Café: Khadija Heeger",
    description:
      "Writers in Conversation with Frank Meintjies: Poet and performer Khadija Heeger in dialogue reflecting on 'Beyond the Delivery Room' (2013) and 'Thicker than Sorrow'. Access included with Saturday Writer's Café Day Access (R100) or valid Festival Pass.",
    date: "2026-11-28",
    startTime: "15:00",
    endTime: "15:45",
    venueId: "loc-central-cafe",
    venueName: "Kleinmond Central Café, 2 Botrivier Road",
    category: "poetry",
    language: "bilingual",
    isTicketed: true,
    ticketPrice: "Writer's Café Day Access (R100)",
    artists: [
      SEED_ARTISTS.find((a) => a.id === "art-khadija-heeger")!,
      SEED_ARTISTS.find((a) => a.id === "art-frank-meintjies")!,
    ],
    accessibilityInfo: "Café seating, shaded outdoor veranda.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: true,
    venueHub: "around_kleinmond",
  },
  {
    id: "evt-sat-cafe-rossouw",
    title: "The Writers Café: JuliJana Rossouw",
    description:
      "Writers in Conversation with Frank Meintjies: Poet and artist JuliJana Rossouw exploring memory, landscape, and 'Scent of Places' (2025). Access included with Saturday Writer's Café Day Access (R100) or valid Festival Pass.",
    date: "2026-11-28",
    startTime: "16:00",
    endTime: "16:45",
    venueId: "loc-central-cafe",
    venueName: "Kleinmond Central Café, 2 Botrivier Road",
    category: "poetry",
    language: "bilingual",
    isTicketed: true,
    ticketPrice: "Writer's Café Day Access (R100)",
    artists: [
      SEED_ARTISTS.find((a) => a.id === "art-julijana-rossouw")!,
      SEED_ARTISTS.find((a) => a.id === "art-frank-meintjies")!,
    ],
    accessibilityInfo: "Café seating, ground floor access.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: false,
    venueHub: "around_kleinmond",
  },

  // ==========================================
  // THE GRAIL CENTRE & HARBOUR SESSIONS ON SATURDAY
  // ==========================================
  {
    id: "evt-sat-grail-our-stories",
    title: "Our Stories — Ons Stories",
    description:
      "Community storytelling and poetry sessions facilitated by Chris Ferndale. Featuring Mengelmoesdigters (10:00–10:45), Jeremy Vearey (11:00–11:45), and Mary Hull & Nicholas Taylor (12:00–13:00).",
    date: "2026-11-28",
    startTime: "10:00",
    endTime: "13:00",
    venueId: "loc-the-grail",
    venueName: "The Grail Centre, 39 15th Avenue",
    category: "stories",
    language: "multilingual",
    isTicketed: true,
    ticketPrice: "R100",
    artists: [
      SEED_ARTISTS.find((a) => a.id === "art-chris-ferndale")!,
      SEED_ARTISTS.find((a) => a.id === "art-mengelmoesdigters")!,
      SEED_ARTISTS.find((a) => a.id === "art-merle-danhouse")!,
      SEED_ARTISTS.find((a) => a.id === "art-theresa-carstens")!,
      SEED_ARTISTS.find((a) => a.id === "art-fiona-fertyn")!,
      SEED_ARTISTS.find((a) => a.id === "art-sophia-olifant")!,
      SEED_ARTISTS.find((a) => a.id === "art-gaireyah-fredericks")!,
      SEED_ARTISTS.find((a) => a.id === "art-jeremy-vearey")!,
      SEED_ARTISTS.find((a) => a.id === "art-mary-hull")!,
      SEED_ARTISTS.find((a) => a.id === "art-nicholas-taylor")!,
    ],
    accessibilityInfo: "The Grail Centre main hall, ramp access and garden courtyard.",
    scheduleStatus: "scheduled",
    statusNotice: "10:00 Mengelmoesdigters • 11:00 Jeremy Vearey • 12:00 Mary Hull & Nicholas Taylor",
    checkInAvailable: true,
    isFeatured: true,
    venueHub: "the_grail",
    subSessions: [
      {
        time: "10:00–10:45",
        title: "Mengelmoesdigters",
        artists: [
          "Merle Danhouse",
          "Theresa Carstens",
          "Fiona Fertyn",
          "Sophia Olifant",
          "Gaireyah Fredericks",
        ],
      },
      {
        time: "11:00–11:45",
        title: "Jeremy Vearey",
        artists: ["Jeremy Vearey"],
      },
      {
        time: "12:00–13:00",
        title: "Mary Hull and Nicholas Taylor",
        artists: ["Mary Hull", "Nicholas Taylor"],
      },
    ],
  },
  {
    id: "evt-sat-writing-workshop",
    title: "Writing into the Darkness",
    description:
      "A Writing Workshop with Colleen Higgs (Modjaji Books) facilitated by Winslow Schalkwyk at The Grail Centre. The workshop encourages participants to access their own writing voice and to write with courage and vitality.",
    date: "2026-11-28",
    startTime: "10:00",
    endTime: "12:30",
    venueId: "loc-the-grail",
    venueName: "The Grail Centre, 39 15th Avenue",
    category: "workshop",
    language: "bilingual",
    isTicketed: true,
    ticketPrice: "R100",
    capacityNote: "Limited to 20 participants",
    artists: [
      SEED_ARTISTS.find((a) => a.id === "art-colleen-higgs")!,
      SEED_ARTISTS.find((a) => a.id === "art-winslow-schalkwyk")!,
    ],
    accessibilityInfo: "Quiet workshop room with natural light and level access at The Grail Centre.",
    scheduleStatus: "scheduled",
    statusNotice: "Modjaji Books Workshop • Limited to 20 participants",
    checkInAvailable: true,
    isFeatured: false,
    venueHub: "the_grail",
  },
  {
    id: "evt-sat-grail-social-artists",
    title: "Social Artists in Collaboration",
    description:
      "Collaborative performance and social arts dialogue with Naren Sewpaul, Jade Gibson, Vuyo Myoli, Indiphile Matini, and Dr. Ncebakazi Mnukwana at The Grail Centre.",
    date: "2026-11-28",
    startTime: "14:00",
    endTime: "16:00",
    venueId: "loc-the-grail",
    venueName: "The Grail Centre, 39 15th Avenue",
    category: "workshop",
    language: "multilingual",
    isTicketed: true,
    ticketPrice: "R100",
    capacityNote: "Limited to 20 audience members",
    artists: [
      SEED_ARTISTS.find((a) => a.id === "art-naren-sewpaul")!,
      SEED_ARTISTS.find((a) => a.id === "art-jade-gibson")!,
      SEED_ARTISTS.find((a) => a.id === "art-vuyo-myoli")!,
      SEED_ARTISTS.find((a) => a.id === "art-indiphile-matini")!,
      SEED_ARTISTS.find((a) => a.id === "art-ncebakazi-mnukwana")!,
    ],
    accessibilityInfo: "Ground floor studio, limited seating capacity for 20 attendees.",
    scheduleStatus: "scheduled",
    statusNotice: "Limited to 20 audience members",
    checkInAvailable: true,
    isFeatured: false,
    venueHub: "the_grail",
  },
  {
    id: "evt-sat-grail-cape-fear",
    title: "Cape Fear: Crime and suspense fiction at the southern tip of Africa",
    description:
      "Andre Louw and Consuelo Roland in conversation with Sonja van der Westhuizen (Catalyst Press) at The Grail Centre.",
    date: "2026-11-28",
    startTime: "14:00",
    endTime: "16:00",
    venueId: "loc-the-grail",
    venueName: "The Grail Centre, 39 15th Avenue",
    category: "stories",
    language: "bilingual",
    isTicketed: true,
    ticketPrice: "R100",
    affiliation: "Catalyst Press",
    artists: [
      SEED_ARTISTS.find((a) => a.id === "art-andre-louw")!,
      SEED_ARTISTS.find((a) => a.id === "art-consuelo-roland")!,
      SEED_ARTISTS.find((a) => a.id === "art-sonja-vanderwesthuizen")!,
    ],
    accessibilityInfo: "The Grail hall, wheelchair ramp, audio reinforcement.",
    scheduleStatus: "scheduled",
    statusNotice: "Catalyst Press Panel • Crime & Suspense Fiction",
    checkInAvailable: true,
    isFeatured: false,
    venueHub: "the_grail",
  },
  {
    id: "evt-sat-sip-and-paint",
    title: "Sip & Paint",
    description:
      "Create your own canvas with guided instruction by artist Beverley (Bev) Brown overlooking Kleinmond Harbour at Tides Restaurant.",
    date: "2026-11-28",
    startTime: "14:00",
    endTime: "17:00",
    venueId: "loc-tides",
    venueName: "Tides Restaurant, Kleinmond Harbour",
    category: "art",
    language: "bilingual",
    isTicketed: true,
    ticketPrice: "R100",
    capacityNote: "Limited to 30 participants",
    artists: [SEED_ARTISTS.find((a) => a.id === "art-beverley-brown")!],
    accessibilityInfo: "Waterfront restaurant terrace, accessible tables and parking.",
    scheduleStatus: "scheduled",
    statusNotice: "Create your own canvas • Limited to 30 participants",
    checkInAvailable: true,
    isFeatured: true,
    venueHub: "around_kleinmond",
  },
  {
    id: "evt-sat-kleinmond-talent",
    title: "KliK Kleinmond Has Talent Competition",
    description:
      "Community talent competition at The Shed, Kleinmond Harbour, hosted by MCs Shardikah Carelse, Vusumuzi Mpofu, and Nathan Appel, featuring a judging panel, certificates, and prizes.",
    date: "2026-11-28",
    startTime: "16:00",
    endTime: "18:30",
    venueId: "loc-the-shed",
    venueName: "The Shed, Kleinmond Harbour",
    category: "competition",
    language: "multilingual",
    isTicketed: false,
    hosts: ["Shardikah Carelse", "Vusumuzi Mpofu", "Nathan Appel"],
    highlights: ["Judging panel", "Certificates", "Prizes"],
    artists: [SEED_ARTISTS.find((a) => a.id === "art-vusumuzi-mpofu")!],
    accessibilityInfo: "Accessible harbour venue, level entrance and seating areas.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: true,
    venueHub: "around_kleinmond",
  },
  {
    id: "evt-sat-sunset-session",
    title: "Poetry and Music Sunset Session",
    description:
      "Evening poetry and live music sunset showcase at The Grail Centre (39 15th Avenue). Entry from 17:30. Featuring Verse & Mense (18:00–18:45), Tribal Echo (19:00–19:45), and Camissa Knights and Poets (20:00–20:45). Refreshments on sale at The Grail.",
    date: "2026-11-28",
    startTime: "18:00",
    endTime: "21:00",
    venueId: "loc-the-grail",
    venueName: "The Grail Centre, 39 15th Avenue",
    category: "music",
    language: "multilingual",
    isTicketed: true,
    ticketPrice: "R100",
    quicketUrl: "https://www.quicket.co.za/events/339579-kleinmond-inniebos-kunstefees-klik/",
    artists: [
      SEED_ARTISTS.find((a) => a.id === "art-verse-en-mense")!,
      SEED_ARTISTS.find((a) => a.id === "art-tribal-echo")!,
      SEED_ARTISTS.find((a) => a.id === "art-camissa-knights")!,
    ],
    accessibilityInfo: "The Grail garden amphitheatre and hall. Warm evening wear recommended.",
    scheduleStatus: "scheduled",
    statusNotice: "Entry from 17:30 • Refreshments on sale at The Grail",
    checkInAvailable: true,
    isFeatured: true,
    venueHub: "the_grail",
    subSessions: [
      {
        time: "18:00–18:45",
        title: "Verse & Mense",
        artists: ["Verse & Mense"],
      },
      {
        time: "19:00–19:45",
        title: "Tribal Echo",
        artists: ["Tribal Echo"],
      },
      {
        time: "20:00–20:45",
        title: "Camissa Knights and Poets",
        artists: ["Camissa Knights and Poets"],
      },
    ],
  },

  // ==========================================
  // SUNDAY, 29 NOVEMBER 2026
  // ==========================================
  {
    id: "evt-sun-strandlooper-kruie",
    title: "Strandlooper Kruie Kuier",
    description:
      "From The Grail to the shoreline with indigenous food storyteller Shihaam Domingo (includes koesisters and lunch).",
    date: "2026-11-29",
    startTime: "09:00",
    endTime: "11:30",
    venueId: "loc-the-grail",
    venueName: "The Grail Centre, 39 15th Avenue",
    category: "outdoor",
    language: "bilingual",
    isTicketed: true,
    ticketPrice: "R100",
    artists: [SEED_ARTISTS.find((a) => a.id === "art-shihaam-domingo")!],
    accessibilityInfo: "Walking route from gardens to coastal paths. Comfortable shoes advised.",
    scheduleStatus: "scheduled",
    statusNotice: "Includes koesisters and lunch • Shoreline walk",
    checkInAvailable: true,
    isFeatured: true,
    venueHub: "sunday_grail",
  },
  {
    id: "evt-sun-open-mic",
    title: "Open Mic",
    description:
      "Open community acoustic and poetry stage facilitated by Vusumuzi Mpofu and Winslow Schalkwyk at The Grail Centre. Free Zone.",
    date: "2026-11-29",
    startTime: "12:00",
    endTime: "12:45",
    venueId: "loc-the-grail",
    venueName: "The Grail Centre, 39 15th Avenue",
    category: "poetry",
    language: "multilingual",
    isTicketed: false,
    artists: [
      SEED_ARTISTS.find((a) => a.id === "art-vusumuzi-mpofu")!,
      SEED_ARTISTS.find((a) => a.id === "art-winslow-schalkwyk")!,
    ],
    accessibilityInfo: "Garden lawn and shaded patio with level access.",
    scheduleStatus: "scheduled",
    checkInAvailable: true,
    isFeatured: false,
    venueHub: "sunday_grail",
  },
  {
    id: "evt-sun-strandlooper-lunch",
    title: "Strandlooper Kruie Kuier — Lunch and Closure",
    description:
      "Communal harvest lunch, shared reflections, and festival closure at The Grail Centre.",
    date: "2026-11-29",
    startTime: "13:00",
    endTime: "14:00",
    venueId: "loc-the-grail",
    venueName: "The Grail Centre, 39 15th Avenue",
    category: "community",
    language: "bilingual",
    isTicketed: true,
    ticketPrice: "Included with Kruie Kuier",
    artists: [SEED_ARTISTS.find((a) => a.id === "art-shihaam-domingo")!],
    accessibilityInfo: "The Grail Centre dining hall and veranda, fully accessible.",
    scheduleStatus: "scheduled",
    statusNotice: "Lunch and festival closure",
    checkInAvailable: true,
    isFeatured: true,
    venueHub: "sunday_grail",
  },
];

export const SEED_CHALLENGE: Challenge = {
  id: "klik-culture-trail-2026",
  title: "The KliK Culture Trail",
  subtitle: "Explore 5 festival venues across Kleinmond to earn your official badge",
  description:
    "Embark on the official KliK 2026 Culture Trail! Check in at participating festival venues (The Shed, Town Hall, Main Beach, The Grail Centre, Central Café, Mthimkhulu Village Centre, or Tides Restaurant) by scanning the QR checkpoint stands.",
  rulesDescription:
    "1. Visit at least 5 distinct festival checkpoints during KliK 2026.\n2. Check in by tapping or scanning the QR checkpoint sign at each venue.\n3. Check-ins work seamlessly even while offline—they sync automatically when you regain signal.\n4. Complete the trail to unlock your digital badge and enter the festival prize draw!",
  requiredCheckInCount: 5,
  requiredDistinctCategoriesCount: 3,
  badgeName: "Official KliK 2026 Culture Explorer",
  badgeIcon: "/assets/klik-round-logo-128.png",
  steps: [
    {
      id: "step-1",
      title: "The Shed or Town Hall",
      description: "Check in at The Shed Harbour venue or the Town Hall Market.",
      targetCategory: "market",
      isRequired: true,
    },
    {
      id: "step-2",
      title: "The Grail Centre",
      description: "Check in during the Art Exhibition, Our Stories, or Sunset Session.",
      targetCategory: "theatre",
      isRequired: true,
    },
    {
      id: "step-3",
      title: "Kleinmond Main Beach or Walk",
      description: "Check in during the See en Fynbos Paradys Staptog.",
      targetCategory: "outdoor",
      isRequired: true,
    },
    {
      id: "step-4",
      title: "The Writers Café",
      description: "Check in at Kleinmond Central Café during an author dialogue.",
      targetCategory: "workshop",
      isRequired: false,
    },
    {
      id: "step-5",
      title: "Mthimkhulu or Tides",
      description: "Check in at Mthimkhulu Village Centre or Sip & Paint at Tides Restaurant.",
      isRequired: false,
    },
  ],
};

export const SEED_NOTICES: FestivalNotice[] = [
  {
    id: "notif-1",
    title: "Official KliK 2026 Festival Programme Live",
    content:
      "Explore the full KliK 2026 schedule across Friday, Saturday, and Sunday in Kleinmond — including the updated Saturday Children & Youth Programme.",
    level: "info",
    createdAt: "2026-11-27T08:00:00Z",
    isActive: true,
  },
  {
    id: "notif-2",
    title: "Welcome and Official Opening of KliK",
    content:
      "Friday 27 November, 19:00–20:30 at The Shed, Kleinmond Harbour: A tribute to Diana Ferrus featuring the Mengelmoesdigters, Frazer Barry and Khadija Heeger.",
    level: "info",
    createdAt: "2026-11-27T12:00:00Z",
    isActive: true,
  },
  {
    id: "notif-3",
    title: "Free Zone Events",
    content:
      "Look for the olive Free Zone tags across the programme for markets, exhibitions, youth workshops, walks, and community showcases open at no charge.",
    level: "info",
    createdAt: "2026-11-27T14:00:00Z",
    isActive: true,
  },
];
