import { SystemGuideItem, item01 } from "./01_create_account";
import { item02 } from "./02_login";
import { item03 } from "./03_it_developer";
import { item04 } from "./04_dashboard";
import { item05 } from "./05_create_lesson_plan_cbc";
import { item06 } from "./06_remedial_lesson_plan";
import { item07 } from "./07_nursery_lesson_plan";
import { item08 } from "./08_presentation_slides";
import { item09 } from "./09_library_and_schemes";
import { item10 } from "./10_homework_and_exams_creator";
import { item11 } from "./11_printable_worksheet";
import { item12 } from "./12_my_lesson_plans";
import { item13 } from "./13_class_diary";
import { item14 } from "./14_ai_certificate_generator";
import { item15 } from "./15_subscription_status";
import { item16 } from "./16_nkundimana_theogene";
import { item17 } from "./17_policy_terms_faq";
import { item18 } from "./18_install_app";
import { item19 } from "./19_help_center";
import { item20 } from "./20_whatsapp_group";
import { item21 } from "./21_admin_panel";
import { item22 } from "./22_sync_data";
import { item23 } from "./23_notification";
import { item24 } from "./24_tutorials_and_system_structure";
import { item25 } from "./25_send_feedback";
import { item26 } from "./26_policy_terms_faq";

export type { SystemGuideItem };

export const SYSTEM_GUIDE_ITEMS: SystemGuideItem[] = [
  item01,
  item02,
  item03,
  item04,
  item05,
  item06,
  item07,
  item08,
  item09,
  item10,
  item11,
  item12,
  item13,
  item14,
  item15,
  item16,
  item17,
  item18,
  item19,
  item20,
  item21,
  item22,
  item23,
  item24,
  item25,
  item26,
];

export function generateFullGuideMarkdown(): string {
  let md = `# 📖 TEACHER TOOL - SYSTEM GUIDE & USER MANUAL\n`;
  md += `**Developer & IT Specialist**: Nkundimana Theogene | **WhatsApp**: 0781339530 / 0724038043\n`;
  md += `**Email**: nkundimana123theogene@gmail.com | **REB CBC Standard Alignment**\n\n`;
  md += `---\n\n`;

  SYSTEM_GUIDE_ITEMS.forEach((item) => {
    md += `### ${item.title}\n`;
    md += `**Category**: ${item.category}\n\n`;
    md += `**Incamake (Summary)**: ${item.summary}\n\n`;
    md += `**Ibikubiyemo (Detailed Steps & Features)**:\n`;
    item.details.forEach((detail, idx) => {
      md += `${idx + 1}. ${detail}\n`;
    });
    md += `\n---\n\n`;
  });

  return md;
}
