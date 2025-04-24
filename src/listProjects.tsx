import { List, ActionPanel, Action, getPreferenceValues, open, showHUD, Clipboard, Color, closeMainWindow } from '@raycast/api';
import { useState, useEffect } from 'react';
import { CommandFactory } from './infrastructure/factories/commandFactory';
import { Project } from './core/models/project';



export default function Command() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const preferences = getPreferenceValues<{ projectsPath: string }>();

  useEffect(() => {
    async function fetchProjects() {
      try {
        if (!preferences.projectsPath) {
          setIsLoading(false);
          return;
        }
        const listProjects = CommandFactory.createListProjects();
        const foundProjects = await listProjects.execute(preferences.projectsPath);
        setProjects(foundProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, [preferences.projectsPath]);

  return (
    <List isLoading={isLoading}>
      {projects.map((project) => (
        <List.Item
          key={project.path}
          title={project.name}
          subtitle={project.path}
          accessories={[
            {
              tag: { value: project.branch, color: Color.Orange },
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Open in Finder"
                onAction={() => openInFinder(project.path)}
              />
              <Action
                title="Copy Path"
                onAction={() => copyPath(project.path)}
              />
              <Action
                title="Open with Windsurf"
                icon={{ source: "../assets/AppIcon.iconset/icon_256x256.png" }}
                onAction={() => openWithWindsurf(project.path)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

async function openInFinder(filePath: string) {
  await open(filePath);
  await showHUD("Opened in Finder");
}

async function copyPath(filePath: string) {
  await Clipboard.copy(filePath);
  await showHUD("Path copied to clipboard");
}

async function openWithWindsurf(projectPath: string) {
  const { exec } = await import("child_process");
  exec(`/Users/martingonzalez/.codeium/windsurf/bin/windsurf "${projectPath}"`, (error) => {
    if (error) {
      showHUD("Failed to open with Windsurf");
    } else {
      closeMainWindow();
    }
  });
}
