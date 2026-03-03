import { useCallback, useEffect, useRef } from 'react';
import { useAgentStore } from '../stores/agentStore';
import { agentService } from '../services/AgentService';

export function useTemplates() {
  const templates = useAgentStore((state) => state.templates);
  const isLoading = useAgentStore((state) => state.isLoadingTemplates);
  const setTemplates = useAgentStore((state) => state.setTemplates);
  const setIsLoadingTemplates = useAgentStore((state) => state.setIsLoadingTemplates);

  const initializedRef = useRef(false);

  const loadTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      const nextTemplates = await agentService.getTemplates();
      setTemplates(nextTemplates);
      return nextTemplates;
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [setIsLoadingTemplates, setTemplates]);

  const loadTemplatesByCategory = useCallback(async (category: string) => {
    return await agentService.getTemplatesByCategory(category);
  }, []);

  const useTemplate = useCallback(async (templateId: string, variables?: Record<string, string>) => {
    await agentService.useTemplate(templateId);
    
    const template = templates.find((t) => t.id === templateId);
    if (!template) return null;

    let content = template.content;
    
    // Replace variables
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
    }

    return {
      ...template,
      content,
    };
  }, [templates]);

  const getCategories = useCallback(() => {
    const categories = new Set(templates.map((t) => t.category));
    return Array.from(categories);
  }, [templates]);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;
    void loadTemplates();
  }, [loadTemplates]);

  return {
    // State
    templates,
    isLoading,
    
    // Actions
    loadTemplates,
    loadTemplatesByCategory,
    useTemplate,
    getCategories,
  };
}
