import Player from "../Player";

export interface IInteractable {
  onInteract(player: Player): void
}


