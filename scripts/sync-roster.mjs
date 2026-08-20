import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const registry = JSON.parse(await readFile(resolve("data/agents-registry.json"), "utf8"));

const escape = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const agentsByDepartment = new Map(registry.departmentSummary.map((department) => [department.id, []]));
for (const agent of registry.agents) {
  const list = agentsByDepartment.get(agent.departmentId);
  if (!list) throw new Error("Unknown department for " + agent.id);
  list.push(agent);
}

const renderRoster = (locale) => {
  const isLao = locale === "lo";
  const indexLabel = isLao ? "\u0E9E\u0EB0\u0EC1\u0E99\u0E81" : "Departments";
  const hubMark = isLao
    ? '<em class="hub-mark">\u0E88\u0EB8\u0E94\u0E81\u0EB2\u0E87</em>'
    : '<em class="hub-mark">Hub</em>';

  const indexLinks = registry.departmentSummary.map((department) => (
    `<a href="#${escape(department.id)}"><span lang="en">${escape(department.name)}</span> <small>${escape(department.agentCount)}</small></a>`
  )).join("");

  const floors = registry.departmentSummary.map((department) => {
    const agents = agentsByDepartment.get(department.id);
    if (agents.length !== department.agentCount) {
      throw new Error("Count mismatch for " + department.id);
    }
    const countLabel = isLao
      ? `${department.agentCount} \u0E9A\u0EBB\u0E94\u0E9A\u0EB2\u0E94`
      : `${department.agentCount} colleagues`;
    const rows = agents.map((agent) => {
      const hub = agent.name === registry.hubAgentName;
      return `<li${hub ? ' class="is-hub"' : ""}><strong lang="en">${escape(agent.name)}</strong>${hub ? hubMark : ""}<span lang="en">${escape(agent.role)}</span></li>`;
    }).join("");

    return `<article class="roster-floor${department.id === "dept-01" ? " is-hub" : ""}" id="${escape(department.id)}">
          <header class="roster-floor__head"><h3 lang="en">${escape(department.name)}</h3><p class="roster-floor__registry" lang="en">${escape(department.description)}</p><span class="roster-count">${escape(countLabel)}</span></header>
          <ul class="roster-list">${rows}</ul>
        </article>`;
  }).join("");

  return `<nav class="roster-index" aria-label="${indexLabel}">${indexLinks}</nav>
        <div class="roster-board">${floors}</div>`;
};

const replaceRoster = async (relativePath, locale) => {
  const path = resolve(relativePath);
  const html = await readFile(path, "utf8");
  if (!html.includes("<!-- roster:start -->")) {
    throw new Error("Missing roster markers in " + relativePath);
  }
  const next = html.replace(
    /<!-- roster:start -->[\s\S]*?<!-- roster:end -->/,
    `<!-- roster:start -->\n        ${renderRoster(locale)}\n        <!-- roster:end -->`
  );
  await writeFile(path, next);
};

await replaceRoster("public/en/index.html", "en");
await replaceRoster("public/lo/index.html", "lo");
console.log("Synced roster from", registry.source);
