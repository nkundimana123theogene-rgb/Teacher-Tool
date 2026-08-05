import { SubscriptionPlan } from '../types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_free',
    plansCount: 3,
    priceFrw: 0,
    label: 'Free Tier (3 plans/mo)',
    isFree: true,
  },
  {
    id: 'plan_10',
    plansCount: 10,
    priceFrw: 1000,
    label: '10 Lesson Plans',
  },
  {
    id: 'plan_15',
    plansCount: 15,
    priceFrw: 1500,
    label: '15 Lesson Plans',
  },
  {
    id: 'plan_25',
    plansCount: 25,
    priceFrw: 2000,
    label: '25 Lesson Plans',
    popular: true,
  },
  {
    id: 'plan_30',
    plansCount: 30,
    priceFrw: 2500,
    label: '30 Lesson Plans',
  },
  {
    id: 'plan_35',
    plansCount: 35,
    priceFrw: 3000,
    label: '35 Lesson Plans',
  },
  {
    id: 'plan_40',
    plansCount: 40,
    priceFrw: 3500,
    label: '40 Lesson Plans',
  },
  {
    id: 'plan_50',
    plansCount: 50,
    priceFrw: 4000,
    label: '50 Lesson Plans',
    popular: true,
  },
  {
    id: 'plan_60',
    plansCount: 60,
    priceFrw: 4500,
    label: '60 Lesson Plans',
  },
  {
    id: 'plan_80',
    plansCount: 80,
    priceFrw: 5000,
    label: '80 Lesson Plans',
  },
  {
    id: 'plan_100',
    plansCount: 100,
    priceFrw: 6000,
    label: '100 Lesson Plans',
  },
  {
    id: 'plan_120',
    plansCount: 120,
    priceFrw: 7000,
    label: '120 Lesson Plans',
  },
  {
    id: 'plan_premium_tools',
    plansCount: 0,
    priceFrw: 2500,
    label: 'Premium Tools (Slides, Exercises, Worksheets, SOW, Class Diary) - 2,500 Rwf/mo',
    popular: true,
  },
];

export const OWNER_INFO = {
  name: 'NKUNDIMANA Theogene',
  websiteName: 'Teacher Tool',
  email: 'nkundimana123theogene@gmail.com',
  whatsapp: '0781339530',
  whatsappUrl: 'https://wa.me/250781339530?text=Hello%20Teacher%20Tool%20Support%2C%20mfasha%20ku%20kibazo%20mfite',
  momoCode: '*182*1*1*0781339530#',
  momoNumbers: ['0781339530'],
  accountHolder: 'NKUNDIMANA Theogene',
};
