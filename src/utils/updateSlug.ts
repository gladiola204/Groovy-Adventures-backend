import slugify from "slugify";

function updateSlug(title: string) {
    const slug = slugify(title, { lower: true, strict: true });
    return slug;
};

export default updateSlug;