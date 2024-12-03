import { Request, Response } from "express";

interface ResponseType<T> {
  code: number;
  success: boolean;
  message: string;
  data: T;
}

export default class HttpService {
  // Message d'erreur pour les erreurs serveurs
  static serverErrorMessage(message: string) {
    return `Erreur du serveur: ${message}`;
  }

  // Fonction pour uniformiser les reponses
  static sendResponse(
    res: Response,
    code: number,
    success: boolean,
    message: string,
    data?: any
  ) {
    const response: ResponseType<any> = { success, message, code, data };
    return res.status(code).json(response);
  }

  // Message d'erreur pour les champs obligatoires
  static fieldRequiredMissedMessage(requiredField: string[]): string {
    return `Veuillez compléter tous les champs obligatoires: ${requiredField}`;
  }

  // Fonction pour verifier les données envoyer dans le body
  static isCompletePostData(req: Request, requiredField: string[]): boolean {
    const body = req.body;
    const bodyKey = Object.keys(body);

    return requiredField.every((field) => {
      return bodyKey.includes(field);
    });
  }

  // Fonction pour verifier les données envoyer en params
  static isCompleteParamsData(req: Request, requiredField: string[]): boolean {
    const params = req.params;
    const paramsKey = Object.keys(params);

    return requiredField.every((field) => {
      return paramsKey.includes(field);
    });
  }

  static isCompleteQueryParamsData(req: Request, requiredField: string[]): boolean {
    const params = req.query;
    const paramsKey = Object.keys(params);

    return requiredField.every((field) => {
      return paramsKey.includes(field);
    });
  }

  // Reponse pour les erreur servers
  static serverError(res: Response, message?: string, data?: any) {
    return this.sendResponse(
      res,
      500,
      false,
      message
        ? this.serverErrorMessage(message)
        : "Oups!! Erreur du serveur...",
      data
    );
  }
}
