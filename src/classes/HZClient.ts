import dotenv from "dotenv";
import path from "path";
import { Client, Collection, Message, MessageReaction, PermissionsBitField, WebhookClient } from "discord.js";
import osu from "node-osu";
import { CommandManager } from "./CommandManager";
import CooldownManager from "./CooldownManager";
import config from "../config";
import constant from "../constant.json";
import getActivity from "../features/utils/getActivity";
import { HZClientOptions } from "../utils/interfaces";
import { ClientMusicManager } from "../classes/Music/Model/ClientMusicManager";
import { HZNetwork } from "./HZNetwork";
import { AutocompleteManager } from "./AutocompleteManager";
import { ButtonManager } from "./ButtonManager";
import { SelectMenuManager } from "./SelectMenuManager";
import { WebhookLogger } from "./WebhookLogger";
import randomElement from "../features/utils/randomElement";
import randomInt from "../features/utils/randomInt";

dotenv.config({ path: path.join(__dirname, '../../src/.env') });

export class HZClient extends Client {
  public devMode: boolean;
  public blockedUsers: Set<string>;

  public logger: WebhookLogger;
  
  public commands: CommandManager;
  public autocomplete: AutocompleteManager;
  public buttons: ButtonManager;
  public selectmenus: SelectMenuManager;

  public cooldown: CooldownManager;
  public music: ClientMusicManager;
  public network: HZNetwork;

  public bugHook: WebhookClient;
  public suggestHook: WebhookClient;
  public replyHook: WebhookClient;

  private _invitePermissions: PermissionsBitField | null;

  constructor(options: HZClientOptions) {
    super(options);
    
    this.devMode = options.devMode ?? false;

    if (!process.env.BLOCKED_USERS) throw new Error('Blocked users not configured.');
    this.blockedUsers = new Set(eval(process.env.BLOCKED_USERS) as string[]);

    this.logger = new WebhookLogger(this);

    this.commands = new CommandManager(this);
    this.autocomplete = new AutocompleteManager(this);
    this.buttons = new ButtonManager(this);
    this.selectmenus = new SelectMenuManager(this);

    this.cooldown = new CooldownManager(this);
    this.music = new ClientMusicManager(this);
    this.network = new HZNetwork(this);

    this.angryList = new Collection();

    this.bugHook = new WebhookClient({ id: config.webhooks.bug.id, token: config.webhooks.bug.token });
    this.suggestHook = new WebhookClient({ id: config.webhooks.suggest.id, token: config.webhooks.suggest.token });
    this.replyHook = new WebhookClient({ id: config.webhooks.reply.id, token: config.webhooks.reply.token });

    this.osuApi = new osu.Api(config.osu.apikey, {
      completeScores: true,
      parseNumeric: true
    });

    this._invitePermissions = null;
  }

  public async initialize(): Promise<void> {
    await this.commands.load(path.join(__dirname, '../commands/'));
    await this.autocomplete.load(path.join(__dirname, '../autocomplete'));
    await this.buttons.load(path.join(__dirname, '../buttons'));
    await this.selectmenus.load(path.join(__dirname, '../selectmenus'));
    await this.network.load();
    this.user?.setActivity(await getActivity(this));
  }

  public get invitePermissions(): PermissionsBitField {
    if (this._invitePermissions) return this._invitePermissions;

    const permissions = new PermissionsBitField();
    this.commands.each(command => {
      permissions.add(command.permissions?.bot ?? []);
    });
    this.commands.subcommands.each(group => {
      group.each(command => {
        permissions.add(command.permissions?.bot ?? []);
      });
    });
    permissions.add(PermissionsBitField.StageModerator);

    return this._invitePermissions = permissions;
  }

  private readonly emojiPool = ['🤔', '😶', '🤨', '😩', '🧐'];
  private readonly ReactConstant = 9808;
  public async randomReact(message: Message): Promise<MessageReaction | void> {
    if (message.author.blocked || message.author.bot) return;
    if (this.devMode && !message.channel.isTestChannel()) return;
    if (randomInt(0, this.ReactConstant - 1)) return;
    const emoji = randomElement(this.emojiPool);
    return message.react(emoji).catch(() => {});
  }

  private readonly pollChannelId = [constant.mainGuild.channels.announcementId, constant.mainGuild.channels.suggestReportId];
  public async poll(message: Message): Promise<void> {
    if (this.pollChannelId.includes(message.channel.id)) {
      await message.react('👍').catch(() => {});
      await message.react('👎').catch(() => {});
    }
  }

  public async guildCount(): Promise<number> {
    const counts = await this.shard?.fetchClientValues('guilds.cache.size').catch(() => {}) as (number[] | undefined);
    return counts?.reduce((acc, cur) => acc + cur, 0) ?? 0;
  }
}