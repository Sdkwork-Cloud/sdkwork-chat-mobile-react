import type { Contact, GroupedContacts, IContactService, IContactsService } from '../types';
import { createContactsService } from './ContactsService';
import type { ServiceFactoryDeps } from '@sdkwork/react-mobile-core';

/**
 * Legacy adapter:
 * keeps backward-compatibility for modules importing `contactService`,
 * while routing all data access to the unified `contactsService`.
 */
class ContactServiceAdapter implements IContactService {
  constructor(private readonly contacts: IContactsService) {}

  async getContacts(): Promise<Contact[]> {
    return this.contacts.getContacts();
  }

  async getGroupedContacts(): Promise<GroupedContacts> {
    const grouped = await this.contacts.getGroupedContacts();
    return {
      groups: grouped.groups,
      sortedKeys: grouped.sortedKeys,
      totalCount: Object.values(grouped.groups).reduce((sum, list) => sum + list.length, 0),
    };
  }

  async findByName(name: string): Promise<Contact | null> {
    return this.contacts.findByName(name);
  }

  async addContact(contact: Partial<Contact>): Promise<Contact> {
    return this.contacts.addContact(contact);
  }

  async removeContact(id: string): Promise<void> {
    await this.contacts.deleteContact(id);
  }
}

export function createContactService(_deps?: ServiceFactoryDeps): IContactService {
  return new ContactServiceAdapter(createContactsService(_deps));
}

export const contactService: IContactService = createContactService();
