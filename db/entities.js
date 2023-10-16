import { Entity, Fields, describeClass } from "remult";
import MarkdownIt from "markdown-it";

const md = MarkdownIt();

export class Redirect {
    /** @type {string} */
    urlSlug;  // i.e. "discord"
    /** @type {string} */
    destination;  // i.e. "https://discord.gg/..."
}

describeClass(
    Redirect,
    Entity(
        "redirects",
        {
            allowApiRead: r => r.user && r.user.isLeader,
            allowApiCrud: r => r.user && r.user.isLeader,
            id: r => r.urlSlug
        }
    ),
    {
        urlSlug: Fields.string(),
        destination: Fields.string()
    }
);

export class StaffMember {
    /** @type {number} */
    id;
    /** @type {string} */
    name;
    /** @type {number} */
    gradYear;
    /** @type {"Spring" | "Summer" | "Fall"} */
    gradTerm;
    /** @type {string | undefined} */
    github;
    /** @type {string | undefined} */
    photo;
    /** @type {string[]} */
    titles;
    /** @type {string} */
    link;
}

describeClass(
    StaffMember,
    Entity(
        "staff",
        {
            allowApiRead: true,
            allowApiCrud: r=> r.user && r.user.isLeader
        },
    ),
    {
        id: Fields.uuid(),
        name: Fields.string(),
        gradYear: Fields.integer(),
        gradTerm: Fields.string({
            validate: t => ["Spring", "Summer", "Fall"].includes(t)
        }),
        github: Fields.string(),
        photo: Fields.string(),
        link: Fields.string(),
        titles: Fields.json()
    }
);

export class Event {
    /** @type {string} */
    id;
    /** @type {string} */
    title;
    /** @type {string} */
    date;
    /** @type {string} */
    subtitle;
    /** @type {string} */
    presenter;
    /** @type {string} */
    link;
    /** @type {string} */
    descriptionMD;
    /** @type {string} */
    descriptionHTML;
}

describeClass(
    Event,
    Entity(
        "events",
        {
            allowApiRead: true,
            allowApiCrud: r=> r.user && r.user.isLeader,
            saving: event => {
                event.descriptionHTML = md.render(event.descriptionMD);
            }
        },
    ),
    {
        id: Fields.uuid(),
        title: Fields.string(),
        date: Fields.string(),
        subtitle: Fields.string(),
        presenter: Fields.string(),
        link: Fields.string(),
        descriptionMD: Fields.string(),
        descriptionHTML: Fields.string()
    }
);