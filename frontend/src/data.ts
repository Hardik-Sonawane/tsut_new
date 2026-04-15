export const DATA = {
  bart: { rouge1: 36.84, rouge2: 16.44, rougeL: 27.65 },
  t5:   { rouge1: 31.49, rouge2: 12.46, rougeL: 23.48 },

  training: [
    { epoch: 'E1', trainLoss: 2.2064, valLoss: 1.6569 },
    { epoch: 'E2', trainLoss: 1.9951, valLoss: 1.6507 },
    { epoch: 'E3', trainLoss: 1.7891, valLoss: 1.6663 },
  ],

  examples: [
    {
      id: 1,
      topic: 'Sports',
      article: 'Novak Djokovic claimed his seventh Wimbledon title after defeating Roger Federer in a record-breaking final that lasted almost five hours. Djokovic denied Federer, who was bidding for a ninth Wimbledon title, in a fifth-set tiebreak, winning 7-6 (5), 1-6, 7-6 (4), 4-6, 13-12 (3). It was the first final in the tournament\'s history to be decided by a final set tie-break and ended as the longest ever Wimbledon men\'s final.',
      reference: 'Novak Djokovic beat Roger Federer in the Wimbledon final in five sets and a record-breaking match lasting almost 5 hours.',
      bart: 'Novak Djokovic defeated Roger Federer 7-6 (5), 1-6, 7-6 (4), 4-6, 13-12 (3) to claim his seventh Wimbledon title. The match was the longest ever Wimbledon men\'s final, decided by the first final set tiebreak in tournament history.',
      t5: 'Novak Djokovic beat Roger Federer to win his seventh Wimbledon title in a record-breaking final that lasted five hours and ended in a fifth-set tiebreak.',
    },
    {
      id: 2,
      topic: 'Science',
      article: 'Scientists have discovered a new species of dinosaur that could be the largest land animal ever to have walked the Earth. The fossilized bones were found in Argentina\'s Patagonian desert and are believed to belong to a titanosaur that lived 100 million years ago during the Late Cretaceous period. Researchers estimate the creature weighed around 77 tons and measured 40 meters in length, making it heavier than a Space Shuttle.',
      reference: 'Fossilized bones discovered in Argentina\'s Patagonian desert are believed to belong to the largest land animal ever.',
      bart: 'Scientists have discovered fossils of what could be the largest land dinosaur ever found in Patagonia, Argentina. The titanosaur weighed around 77 tons and measured 40 meters in length, larger than a Space Shuttle.',
      t5: 'Scientists have found fossils in Argentina that may belong to the largest land animal ever - a 100 million year old titanosaur weighing 77 tons.',
    },
    {
      id: 3,
      topic: 'Technology',
      article: 'Apple unveiled its latest iPhone lineup at its annual fall event, featuring upgraded camera systems, a new A18 chip, and improved battery life across all models. The company also introduced iOS 18, which brings AI-powered features including enhanced Siri capabilities, smart photo editing tools, and on-device machine learning for personal context. The new phones will start at $799 and ship next week.',
      reference: 'Apple announced new iPhones with improved cameras, the A18 chip, and AI features through iOS 18 starting at $799.',
      bart: 'Apple has unveiled its new iPhone lineup with upgraded camera systems and A18 chip at its annual fall event. The phones feature iOS 18 with AI-powered Siri, smart photo editing, and on-device machine learning, starting at $799.',
      t5: 'Apple revealed new iPhones with the A18 chip and iOS 18 with AI capabilities at its yearly event, starting at $799.',
    },
  ],

  config: {
    model: 't5-small',
    lr: '5e-4',
    batchSize: 4,
    warmupSteps: 200,
    weightDecay: 0.01,
    hardware: 'Tesla T4',
    maxInput: 512,
    maxTarget: 128,
    epochs: 3,
    trainSamples: 2000,
    valSamples: 200,
    testSamples: 100,
    dataset: 'CNN/DailyMail 3.0.0',
  }
}

export type Example = typeof DATA.examples[0]
